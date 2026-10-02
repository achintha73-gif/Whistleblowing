// -------------------------------------------------------------
// Settings Feature - Type Definitions
// -------------------------------------------------------------

/**
 * Well-known setting keys used by the app.
 */
export const SETTING_KEYS = {
  SITE_NAME: 'site_name',
  SUPPORT_EMAIL: 'support_email',
  MAX_UPLOAD_MB: 'max_upload_mb',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/**
 * A single setting as stored in DB.
 */
export interface SettingDTO {
  settingId: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

/**
 * Editable settings payload.
 */
export interface EditableSettings {
  siteName: string;
  supportEmail: string;
  maxUploadMb: number;
}

/**
 * Input for updating settings.
 */
export interface UpdateSettingsInput {
  siteName: string;
  supportEmail: string;
  maxUploadMb: number;
}