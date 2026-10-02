import { prisma } from '@/lib/db';

/**
 * Notification Repository - DB access ONLY.
 */

/**
 * Create a single notification for a user.
 */
export async function createNotification(data: {
  user_id: number;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      user_id: data.user_id,
      message: data.message,
    },
  });
}

/**
 * Create multiple notifications in one query.
 * Useful when an event affects several users (manager + investigator).
 */
export async function createManyNotifications(
  rows: { user_id: number; message: string }[]
) {
  if (rows.length === 0) return { count: 0 };
  return prisma.notification.createMany({
    data: rows,
  });
}

/**
 * List all notifications for a user, newest first.
 */
export async function listNotificationsForUser(userId: number) {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 100,
  });
}

/**
 * Count unread notifications for a user.
 */
export async function countUnreadNotifications(userId: number): Promise<number> {
  return prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });
}

/**
 * Mark a notification as read.
 * Only if it belongs to the given user (security).
 */
export async function markAsRead(notificationId: number, userId: number) {
  return prisma.notification.updateMany({
    where: {
      notification_id: notificationId,
      user_id: userId,
    },
    data: { is_read: true },
  });
}

/**
 * Mark ALL notifications for a user as read.
 */
export async function markAllAsRead(userId: number) {
  return prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
}