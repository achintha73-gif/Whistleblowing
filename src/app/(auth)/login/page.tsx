import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata = {
  title: 'Sign in - Whistleblowing System',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Whistleblowing System</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          If you do not have an account, contact your administrator.
        </p>
      </div>
    </div>
  );
}
