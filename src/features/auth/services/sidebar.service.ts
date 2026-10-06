import { prisma } from '@/lib/db';
import type { SafeUser } from '../types';

/**
 * Sidebar badge counts.
 * Each role sees different counts on different menu items.
 */
export interface SidebarBadges {
  notifications: number;
  complaints: number;
  cases: number;
}

/**
 * Fetch all sidebar badge counts for the current user in a single call.
 */
export async function getSidebarBadges(user: SafeUser): Promise<SidebarBadges> {
  // Unread notifications — common to all roles
  const notifications = await prisma.notification.count({
    where: { user_id: user.userId, is_read: false },
  });

  let complaints = 0;
  let cases = 0;

  if (user.roleName === 'MANAGER') {
    // Pending complaints awaiting review
    complaints = await prisma.complaint.count({
      where: { status: 'PENDING' },
    });
    // Unassigned active cases
    cases = await prisma.case.count({
      where: {
        assigned_investigator_id: null,
        status: { notIn: ['CLOSED', 'ARCHIVED'] },
      },
    });
  } else if (user.roleName === 'INVESTIGATOR') {
    // Active cases assigned to this investigator
    cases = await prisma.case.count({
      where: {
        assigned_investigator_id: user.userId,
        status: { in: ['OPEN', 'INVESTIGATING', 'PENDING_REVIEW'] },
      },
    });
  } else if (user.roleName === 'ADMIN') {
    // Total users for admin (optional, can be 0 if not shown)
    complaints = 0;
    cases = 0;
  } else if (user.roleName === 'USER') {
    // Complaints in review (awaiting response)
    complaints = await prisma.complaint.count({
      where: {
        user_id: user.userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });
  }

  return { notifications, complaints, cases };
}