import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const metadata = {
  title: 'Reset password - Whistleblowing System',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Invalid reset link
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              This password reset link is missing or malformed.
            </p>
            <Link
              href="/forgot-password"
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set a new password for your account
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}