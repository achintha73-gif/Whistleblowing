import { prisma } from '@/lib/db';

/**
 * Settings Repository - DB access ONLY.
 */

export async function listAllSettings() {
  return prisma.systemSetting.findMany({
    orderBy: { key: 'asc' },
  });
}

export async function findSettingByKey(key: string) {
  return prisma.systemSetting.findUnique({
    where: { key },
  });
}

/**
 * Upsert a setting (create if missing, update if exists).
 */
export async function upsertSetting(data: {
  key: string;
  value: string;
  description?: string | null;
  userId?: number | null;
}) {
  return prisma.systemSetting.upsert({
    where: { key: data.key },
    create: {
      key: data.key,
      value: data.value,
      description: data.description ?? null,
      user_id: data.userId ?? null,
    },
    update: {
      value: data.value,
      user_id: data.userId ?? null,
    },
  });
}