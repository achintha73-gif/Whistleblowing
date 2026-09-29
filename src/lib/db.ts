// ===============================================
// Prisma Client Singleton
// ===============================================
// This file creates a single Prisma Client instance
// that is reused across the application.
//
// In development, Next.js hot-reloads modules, which
// can create multiple Prisma Client instances and
// exhaust the database connection pool. This pattern
// prevents that by storing the client on `globalThis`.
// ===============================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}