import { LoginForm } from '@/features/auth/components/LoginForm';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

export const metadata = {
  title: 'Sign in - Whistleblowing System',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/40 blur-3xl" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
          {/* Logo + Title */}
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-gray-900">
              Whistleblowing System
            </h1>
            <p className="mt-1 text-xs font-medium text-gray-500">
              Secure. Anonymous. Trusted.
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Whistleblowing Management System
        </p>
      </div>
    </div>
  );
}

function Badge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white/60 px-2 py-1.5 text-[11px] font-medium text-gray-600 backdrop-blur-sm">
      <span className="text-blue-600">{icon}</span>
      {label}
    </div>
  );
}