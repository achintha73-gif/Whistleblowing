import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET, SESSION_MAX_AGE_SECONDS } from '@/lib/auth-config';
import type { RoleName, SafeUser, SessionPayload } from '../types';
import * as userRepo from '../repository/user.repository';
import * as roleRepo from '../repository/role.repository';
import type { RegisterInput } from '../types';

// -------------------------------------------------------------
// Password Hashing
// -------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// -------------------------------------------------------------
// JWT Signing & Verification
// -------------------------------------------------------------

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });

    // Validate the payload shape
    if (
      typeof payload.userId !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.roleName !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      roleName: payload.roleName as RoleName,
      name: payload.name,
    };
  } catch {
    // Invalid, expired, or tampered token
    return null;
  }
}

// -------------------------------------------------------------
// User Mapping (strip password)
// -------------------------------------------------------------

type PrismaUserWithRole = {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role_id: number;
  department_id: number | null;
  created_at: Date;
  role: {
    role_id: number;
    role_name: RoleName;
  };
};

export function toSafeUser(user: PrismaUserWithRole): SafeUser {
  return {
    userId: user.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status as SafeUser['status'],
    roleId: user.role_id,
    roleName: user.role.role_name,
    departmentId: user.department_id,
    createdAt: user.created_at,
  };
}

// -------------------------------------------------------------
// Login
// -------------------------------------------------------------

export interface LoginResult {
  success: true;
  user: SafeUser;
  token: string;
}

export interface LoginError {
  success: false;
  error: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult | LoginError> {
  const user = await userRepo.findUserByEmail(email);

  // IMPORTANT: Same error message whether user exists or password is wrong.
  // This prevents attackers from discovering which emails are registered.
  const GENERIC_ERROR = 'Invalid email or password';

  if (!user) {
    return { success: false, error: GENERIC_ERROR };
  }

  if (user.status !== 'ACTIVE') {
    return { success: false, error: 'Account is not active' };
  }

  const passwordOk = await verifyPassword(password, user.password);
  if (!passwordOk) {
    return { success: false, error: GENERIC_ERROR };
  }

  const safeUser = toSafeUser(user);

  const token = await signSessionToken({
    userId: safeUser.userId,
    email: safeUser.email,
    roleName: safeUser.roleName,
    name: safeUser.name,
  });

  return { success: true, user: safeUser, token };
}

// -------------------------------------------------------------
// Register (creates a USER by default)
// -------------------------------------------------------------

export interface RegisterResult {
  success: true;
  user: SafeUser;
}

export interface RegisterError {
  success: false;
  error: string;
}

export async function register(
  input: RegisterInput
): Promise<RegisterResult | RegisterError> {
  const existing = await userRepo.emailExists(input.email);
  if (existing) {
    return { success: false, error: 'Email is already registered' };
  }

  const role = await roleRepo.findRoleByName(input.roleName);
  if (!role) {
    return { success: false, error: 'Invalid role' };
  }

  const hashedPassword = await hashPassword(input.password);

  const created = await userRepo.createUser({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    phone: input.phone ?? null,
    role_id: role.role_id,
    department_id: input.departmentId ?? null,
  });

  return { success: true, user: toSafeUser(created) };
}

// -------------------------------------------------------------
// Session hydration (JWT -> fresh user from DB)
// -------------------------------------------------------------

export async function getUserFromToken(
  token: string
): Promise<SafeUser | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await userRepo.findUserById(payload.userId);
  if (!user || user.status !== 'ACTIVE') return null;

  return toSafeUser(user);
}
