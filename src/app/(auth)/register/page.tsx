import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata = {
  title: 'Create account - Whistleblowing System',
};

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to login */}
        <Link
          href="/login"
          className="group mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          Back to sign in
        </Link>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
          {/* Logo + Title */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
              <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="mt-1 text-xs font-medium text-gray-500">
              Register as an employee to submit complaints
            </p>
          </div>

          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Whistleblowing Management System
        </p>
      </div>
    </div>
  );
}