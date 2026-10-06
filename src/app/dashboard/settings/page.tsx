import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Info, Settings } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            System Settings
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Configure system-wide settings and options.
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />

      {/* Read-only info — glass */}
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              System Information
            </h2>
            <p className="text-xs text-gray-500">
              Read-only environment details
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-white/60 pb-2">
            <dt className="text-gray-500">Environment</dt>
            <dd className="font-medium text-gray-900">
              {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </dd>
          </div>
          <div className="flex justify-between border-b border-white/60 pb-2">
            <dt className="text-gray-500">Session duration</dt>
            <dd className="font-medium text-gray-900">7 days</dd>
          </div>
          <div className="flex justify-between border-b border-white/60 pb-2">
            <dt className="text-gray-500">Password reset expiry</dt>
            <dd className="font-medium text-gray-900">60 minutes</dd>
          </div>
          <div className="flex justify-between border-b border-white/60 pb-2">
            <dt className="text-gray-500">Email provider</dt>
            <dd className="font-medium text-gray-900">SMTP (Ethereal in dev)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}