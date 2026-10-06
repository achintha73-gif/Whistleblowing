import { LoginForm } from '@/features/auth/components/LoginForm';
import { Shield, Lock, Eye, FileCheck, Check, FileText } from 'lucide-react';

export const metadata = {
  title: 'Sign in - Whistleblowing System',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Main white card */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-gray-400/30">
        {/* Decorative blur (top-right, like reference) */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-300/50 to-pink-300/50 blur-3xl" />

        {/* Grid: left gradient + right form */}
        <div className="relative grid gap-0 lg:grid-cols-2">
          {/* Left panel: gradient card (inset) */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 text-white lg:m-6 lg:flex lg:flex-col lg:justify-between lg:rounded-[1.75rem] xl:p-12">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

            {/* Top: Logo */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight">
                  Whistleblowing
                </div>
                <div className="text-[11px] text-white/70">
                  Management System
                </div>
              </div>
            </div>

            {/* Middle: Title + illustration + features */}
            <div className="relative z-10 py-8">
              <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
                Report with
                <br />
                confidence.
                <br />
                <span className="text-white/80">Stay anonymous.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm text-white/80">
                A secure platform to report workplace concerns — with full
                anonymity, tracking, and role-based investigation.
              </p>

              {/* Illustration: icon composition */}
              <div className="mt-8 mb-6 flex items-center justify-center">
                <div className="relative flex h-40 w-full max-w-xs items-center justify-center rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm">
                  {/* Central shield */}
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-2xl shadow-black/20 backdrop-blur-md">
                    <Shield
                      className="h-10 w-10 text-white"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Orbiting icons */}
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                    <Lock className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                    <FileText className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                    <Eye className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
                    <FileCheck className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>

                  {/* Dotted connecting lines hint (subtle) */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                </div>
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5">
                <FeatureItem
                  icon={<Lock className="h-4 w-4" />}
                  text="End-to-end secure authentication"
                />
                <FeatureItem
                  icon={<Eye className="h-4 w-4" />}
                  text="Anonymous reporting with tracking codes"
                />
                <FeatureItem
                  icon={<FileCheck className="h-4 w-4" />}
                  text="Evidence uploads and investigation reports"
                />
                <FeatureItem
                  icon={<Check className="h-4 w-4" />}
                  text="Role-based access for all users"
                />
              </ul>
            </div>

            {/* Bottom: footer */}
            <div className="relative z-10 text-[11px] text-white/60">
              © {new Date().getFullYear()} Whistleblowing Management System
            </div>
          </div>

          {/* Right panel: form */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {/* Mobile logo */}
            <div className="mb-6 flex flex-col items-center text-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
                <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Desktop logo */}
            <div className="mb-6 hidden items-center justify-center gap-2 lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/30">
                <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-600">
                Whistleblowing
              </span>
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Welcome Back
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Please login to your account
              </p>
            </div>

            {/* Form with Employee/Anonymous tabs */}
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 border border-white/20 backdrop-blur-sm">
        {icon}
      </span>
      <span className="pt-0.5 text-sm text-white/90">{text}</span>
    </li>
  );
}