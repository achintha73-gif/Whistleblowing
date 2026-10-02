import type { SafeUser } from '@/features/auth/types';
import type { EditableSettings, UpdateSettingsInput } from '../types';
import { SETTING_KEYS } from '../types';
import * as repo from '../repository/settings.repository';

// -------------------------------------------------------------
// Defaults
// -------------------------------------------------------------

const DEFAULTS: EditableSettings = {
  siteName: 'Whistleblowing System',
  supportEmail: 'support@wb.local',
  maxUploadMb: 5,
};

// -------------------------------------------------------------
// Read
// -------------------------------------------------------------

/**
 * Get editable settings with defaults applied.
 * Any admin can read.
 */
export async function getEditableSettings(): Promise<EditableSettings> {
  const rows = await repo.listAllSettings();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  const maxUpload = Number(map[SETTING_KEYS.MAX_UPLOAD_MB]);
  return {
    siteName: map[SETTING_KEYS.SITE_NAME] ?? DEFAULTS.siteName,
    supportEmail: map[SETTING_KEYS.SUPPORT_EMAIL] ?? DEFAULTS.supportEmail,
    maxUploadMb:
      Number.isFinite(maxUpload) && maxUpload > 0
        ? maxUpload
        : DEFAULTS.maxUploadMb,
  };
}

/**
 * Get all settings as a flat key-value map (for internal use).
 */
export async function getAllSettingsMap(): Promise<Record<string, string>> {
  const rows = await repo.listAllSettings();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

// -------------------------------------------------------------
// Update
// -------------------------------------------------------------

export interface UpdateResult {
  success: true;
}

export interface UpdateError {
  success: false;
  error: string;
}

export async function updateSettings(
  user: SafeUser,
  input: UpdateSettingsInput
): Promise<UpdateResult | UpdateError> {
  if (user.roleName !== 'ADMIN') {
    return { success: false, error: 'Only admins can update settings' };
  }

  // Validate
  const siteName = input.siteName.trim();
  const supportEmail = input.supportEmail.trim();
  const maxUploadMb = Number(input.maxUploadMb);

  if (siteName.length < 2) {
    return { success: false, error: 'Site name is too short' };
  }
  if (siteName.length > 100) {
    return { success: false, error: 'Site name is too long' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return { success: false, error: 'Invalid support email' };
  }
  if (!Number.isInteger(maxUploadMb) || maxUploadMb < 1 || maxUploadMb > 100) {
    return {
      success: false,
      error: 'Max upload size must be between 1 and 100 MB',
    };
  }

  // Upsert all three
  await repo.upsertSetting({
    key: SETTING_KEYS.SITE_NAME,
    value: siteName,
    description: 'Display name for the application',
    userId: user.userId,
  });
  await repo.upsertSetting({
    key: SETTING_KEYS.SUPPORT_EMAIL,
    value: supportEmail,
    description: 'Support contact email',
    userId: user.userId,
  });
  await repo.upsertSetting({
    key: SETTING_KEYS.MAX_UPLOAD_MB,
    value: String(maxUploadMb),
    description: 'Maximum evidence file upload size in MB',
    userId: user.userId,
  });

  return { success: true };
}