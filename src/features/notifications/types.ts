// -------------------------------------------------------------
// Notification Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Notification types - for UI icons/colors.
 * Not stored in DB (message is free-form), just for display.
 */
export const NOTIFICATION_TYPES = {
  CASE_CREATED: 'CASE_CREATED',
  INVESTIGATOR_ASSIGNED: 'INVESTIGATOR_ASSIGNED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  EVIDENCE_ADDED: 'EVIDENCE_ADDED',
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  ADDITIONAL_INFO: 'ADDITIONAL_INFO',
  GENERAL: 'GENERAL',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification as returned to the client.
 */
export interface NotificationDTO {
  notificationId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Input for creating a notification.
 */
export interface CreateNotificationInput {
  userId: number;
  message: string;
}