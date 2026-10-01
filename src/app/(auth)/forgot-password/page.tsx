import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot password - Whistleblowing System',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-1 text-sm text-gray-600">
            We will help you reset it
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}