import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Shield,
  ArrowRight,
  MessageCircle,
  FileQuestion,
  BookOpen,
} from 'lucide-react';

export const metadata = {
  title: 'Support - Whistleblowing System',
};

const CONTACTS = [
  {
    icon: Mail,
    accent: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30',
    title: 'Email Support',
    value: 'support@wb.local',
    description: 'Response within 24 hours',
    href: 'mailto:support@wb.local',
  },
  {
    icon: Phone,
    accent: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    title: 'Emergency Hotline',
    value: '+94 11 234 5678',
    description: 'Mon-Fri, 9:00 AM - 5:00 PM',
    href: 'tel:+94112345678',
  },
  {
    icon: MapPin,
    accent: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    title: 'Office',
    value: '123 Main Street, Colombo',
    description: 'Visit by appointment',
    href: null,
  },
];

const FAQS = [
  {
    q: 'How do I submit a complaint?',
    a: 'Go to your dashboard and click "Submit New Complaint". You can attach evidence and choose to submit anonymously if you prefer.',
  },
  {
    q: 'Can I submit anonymously?',
    a: 'Yes. Use the Anonymous login tab on the login page, or check "Submit anonymously" when filing a complaint. Your identity will be completely hidden.',
  },
  {
    q: 'How do I track an anonymous complaint?',
    a: 'When you submit anonymously, you receive a reference code (WB-XXXX-XXXX). Visit /track and enter the code to view status and add additional information.',
  },
  {
    q: 'Who can see my complaint?',
    a: 'Only authorized staff (managers, investigators, and admins) can see complaints. Anonymous complaints are never linked to your identity.',
  },
  {
    q: 'What happens after I submit?',
    a: 'A manager reviews the complaint. If approved, it becomes a case and is assigned to an investigator. You will receive notifications about status changes.',
  },
  {
    q: 'What evidence can I attach?',
    a: 'PDF, images, documents, and videos up to 5 MB per file. You can attach up to 5 files per complaint.',
  },
];

export default async function SupportPage() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <HelpCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Support
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Get help, browse FAQs, or contact our team.
          </p>
        </div>
      </div>

      {/* Contact cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTACTS.map((c) => {
          const Icon = c.icon;
          const content = (
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/40 blur-3xl" />
              <div
                className={`relative mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.accent} shadow-lg ${c.shadow}`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {c.title}
                </div>
                <div className="mt-1 text-base font-semibold text-gray-900">
                  {c.value}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {c.description}
                </div>
              </div>
            </div>
          );

          return c.href ? (
            <a
              key={c.title}
              href={c.href}
              className="block h-full cursor-pointer"
            >
              {content}
            </a>
          ) : (
            <div key={c.title}>{content}</div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl sm:p-8">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FileQuestion className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-500">
              Common questions about the whistleblowing process
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {FAQS.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-gray-200/70 bg-white/60 p-4 transition open:border-blue-300 open:bg-white open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {item.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-open:rotate-45 group-open:bg-blue-100 group-open:text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Anonymous reminder */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/30 sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Prefer to stay anonymous?
              </h3>
              <p className="mt-1 text-sm text-white/85 max-w-md">
                Submit a complaint without logging in. You&apos;ll receive a
                reference code to track progress.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              <Shield className="h-4 w-4" />
              Report Anonymously
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" />
              Track Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Documentation link */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg shadow-blue-900/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Need more details?
            </h3>
            <p className="text-xs text-gray-500">
              Read the user guide and policy documentation.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back to dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}