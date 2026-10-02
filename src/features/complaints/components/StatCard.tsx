import type { ReactNode } from 'react';

export type StatCardAccent = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';

const ACCENT_STYLES: Record<
  StatCardAccent,
  { gradient: string; iconBg: string }
> = {
  blue: {
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconBg: 'bg-white/20 text-white',
  },
  green: {
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    iconBg: 'bg-white/20 text-white',
  },
  amber: {
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
    iconBg: 'bg-white/20 text-white',
  },
  red: {
    gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    iconBg: 'bg-white/20 text-white',
  },
  purple: {
    gradient: 'bg-gradient-to-br from-purple-500 to-violet-600',
    iconBg: 'bg-white/20 text-white',
  },
  gray: {
    gradient: 'bg-gradient-to-br from-slate-500 to-slate-600',
    iconBg: 'bg-white/20 text-white',
  },
};

export function StatCard({
  label,
  value,
  accent = 'gray',
  subtitle,
  icon,
}: {
  label: string;
  value: number | string;
  accent?: StatCardAccent;
  subtitle?: string;
  icon?: ReactNode;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl ${styles.gradient} p-5 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${styles.iconBg} backdrop-blur-sm`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-white/80">
            {label}
          </div>
          <div className="mt-1 text-3xl font-bold text-white">
            {value}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-white/70">{subtitle}</div>
          )}
        </div>
      </div>

      {/* Decorative circle in corner */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
}