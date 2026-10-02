import { prisma } from '@/lib/db';
import type { SafeUser } from '@/features/auth/types';
import type { NotificationDTO } from '../types';
import * as repo from '../repository/notification.repository';

// -------------------------------------------------------------
// Prisma -> DTO
// -------------------------------------------------------------

type PrismaNotificationRow = {
  notification_id: number;
  message: string;
  is_read: boolean;
  created_at: Date;
  user_id: number;
};

export function toNotificationDTO(row: PrismaNotificationRow): NotificationDTO {
  return {
    notificationId: row.notification_id,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

// -------------------------------------------------------------
// Create
// -------------------------------------------------------------

export async function notifyUser(
  userId: number | null,
  message: string
): Promise<void> {
  if (!userId) return;
  await repo.createNotification({ user_id: userId, message });
}

export async function notifyUsers(
  userIds: (number | null)[],
  message: string
): Promise<void> {
  const rows = userIds
    .filter((id): id is number => typeof id === 'number')
    .map((user_id) => ({ user_id, message }));
  await repo.createManyNotifications(rows);
}

// -------------------------------------------------------------
// List / Count
// -------------------------------------------------------------

export async function getNotificationsForUser(
  user: SafeUser
): Promise<NotificationDTO[]> {
  const rows = await repo.listNotificationsForUser(user.userId);
  return rows.map(toNotificationDTO);
}

export async function getUnreadCount(user: SafeUser): Promise<number> {
  return repo.countUnreadNotifications(user.userId);
}

// -------------------------------------------------------------
// Mark as read
// -------------------------------------------------------------

export async function markNotificationRead(
  user: SafeUser,
  notificationId: number
): Promise<{ success: boolean }> {
  await repo.markAsRead(notificationId, user.userId);
  return { success: true };
}

export async function markAllNotificationsRead(
  user: SafeUser
): Promise<{ success: boolean }> {
  await repo.markAllAsRead(user.userId);
  return { success: true };
}

// -------------------------------------------------------------
// Helper: find the manager of a case's investigator
// -------------------------------------------------------------

/**
 * Find the manager who should be notified about a case.
 * Logic: look at the assigned investigator's department and get its manager.
 * Returns null if no investigator, no department, or no manager.
 */
export async function getManagerForCase(
  caseId: number
): Promise<number | null> {
  const caseRow = await prisma.case.findUnique({
    where: { case_id: caseId },
    include: {
      assignedInvestigator: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!caseRow?.assignedInvestigator?.department?.manager_id) {
    return null;
  }

  return caseRow.assignedInvestigator.department.manager_id;
}