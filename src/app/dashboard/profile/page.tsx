import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ProfileForm } from '@/features/users/components/ProfileForm';
import { ChangePasswordForm } from '@/features/users/components/ChangePasswordForm';
import { getProfile } from '@/features/users/services/profile.service';

export const metadata = {
  title: 'My Profile - Whistleblowing System',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  INVESTIGATOR: 'Investigator',
  USER: 'Employee',
};

const AVATAR_GRADIENTS: Record<string, string> = {
  ADMIN: 'from-purple-500 to-purple-700',
  MANAGER: 'from-blue-500 to-blue-700',
  INVESTIGATOR: 'from-amber-500 to-orange-600',
  USER: 'from-emerald-500 to-emerald-700',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
};

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const profile = await getProfile(user);
  if (!profile) {
    redirect('/login');
  }

  const avatarGradient =
    AVATAR_GRADIENTS[user.roleName] ?? 'from-slate-500 to-slate-700';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your account information.
        </p>
      </div>

      {/* Profile header card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-2xl font-bold text-white shadow-md`}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {profile.email}
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {ROLE_LABELS[profile.roleName] ?? profile.roleName}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[profile.status] ??
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {profile.status}
                </span>
                {profile.departmentName && (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {profile.departmentName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meta strip */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <div className="flex items-center gap-6 text-xs text-gray-500 flex-wrap">
            <span>
              <span className="font-medium text-gray-700">Member since:</span>{' '}
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>
              <span className="font-medium text-gray-700">User ID:</span> #
              {profile.userId}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Profile Information
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Update your name and contact details
            </p>
          </div>
          <div className="p-6">
            <ProfileForm profile={profile} />
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Change Password
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Update your account password
            </p>
          </div>
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}