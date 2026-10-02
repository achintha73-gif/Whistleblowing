import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Info } from 'lucide-react';
import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { getEditableSettings } from '@/features/settings/services/settings.service';

export const metadata = {
  title: 'System Settings - Whistleblowing System',
};

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  if (user.roleName !== 'ADMIN') {
    redirect('/dashboard');
  }

  const settings = await getEditableSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure system-wide settings and options.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />

      {/* Read-only info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">
            System Information
          </h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Environment</dt>
            <dd className="font-medium text-gray-900">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Session duration</dt>
            <dd className="font-medium text-gray-900">7 days</dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Password reset expiry</dt>
            <dd className="font-medium text-gray-900">60 minutes</dd>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <dt className="text-gray-500">Email provider</dt>
            <dd className="font-medium text-gray-900">SMTP (Ethereal in dev)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}