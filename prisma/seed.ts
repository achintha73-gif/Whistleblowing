import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // -------------------------------------------------------------
  // 1. Create Roles
  // -------------------------------------------------------------
  const roleData: { role_name: RoleName; description: string }[] = [
    { role_name: 'ADMIN', description: 'System administrator' },
    { role_name: 'MANAGER', description: 'Reviews complaints and assigns investigators' },
    { role_name: 'INVESTIGATOR', description: 'Investigates cases and collects evidence' },
    { role_name: 'USER', description: 'Employee / Whistleblower' },
  ];

  for (const role of roleData) {
    await prisma.role.upsert({
      where: { role_name: role.role_name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('Roles seeded');

  // -------------------------------------------------------------
  // 2. Create a default department
  // -------------------------------------------------------------
  const department = await prisma.department.upsert({
    where: { department_name: 'General' },
    update: {},
    create: {
      department_name: 'General',
      description: 'Default department for test users',
      status: 'active',
    },
  });
  console.log('Department seeded:', department.department_name);

  // -------------------------------------------------------------
  // 3. Create test users (one per role)
  //    Passwords are hashed with bcrypt (12 rounds)
  // -------------------------------------------------------------
  const BCRYPT_ROUNDS = 12;

  const users = [
    {
      name: 'System Admin',
      email: 'admin@wb.local',
      password: 'Admin@12345',
      roleName: 'ADMIN' as RoleName,
      departmentId: null as number | null,
    },
    {
      name: 'Maria Manager',
      email: 'manager@wb.local',
      password: 'Manager@12345',
      roleName: 'MANAGER' as RoleName,
      departmentId: department.department_id,
    },
    {
      name: 'Ivan Investigator',
      email: 'investigator@wb.local',
      password: 'Investigator@12345',
      roleName: 'INVESTIGATOR' as RoleName,
      departmentId: department.department_id,
    },
    {
      name: 'Eve Employee',
      email: 'employee@wb.local',
      password: 'Employee@12345',
      roleName: 'USER' as RoleName,
      departmentId: department.department_id,
    },
  ];

  for (const u of users) {
    const role = await prisma.role.findUnique({
      where: { role_name: u.roleName },
    });
    if (!role) {
      throw new Error('Role not found: ' + u.roleName);
    }

    const hashed = await bcrypt.hash(u.password, BCRYPT_ROUNDS);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        role_id: role.role_id,
        department_id: u.departmentId,
        status: UserStatus.ACTIVE,
      },
    });

    console.log('User seeded:', u.email);
  }

  console.log('Seeding complete.');
  console.log('');
  console.log('Test credentials:');
  console.log('  admin@wb.local         / Admin@12345');
  console.log('  manager@wb.local       / Manager@12345');
  console.log('  investigator@wb.local  / Investigator@12345');
  console.log('  employee@wb.local      / Employee@12345');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });