import type { ReactNode } from 'react';

export type EdukaAccent =
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'red'
  | 'slate';

interface AccentStyle {
  gradient: string;
  shadow: string;
  miniBg: string;
}

const ACCENTS: Record<EdukaAccent, AccentStyle> = {
  green: {
    gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
    shadow: 'shadow-lg shadow-emerald-500/25',
    miniBg: 'bg-white/20',
  },
  blue: {
    gradient: 'bg-gradient-to-br from-sky-400 to-sky-500',
    shadow: 'shadow-lg shadow-sky-500/25',
    miniBg: 'bg-white/20',
  },
  purple: {
    gradient: 'bg-gradient-to-br from-violet-400 to-violet-500',
    shadow: 'shadow-lg shadow-violet-500/25',
    miniBg: 'bg-white/20',
  },
  orange: {
    gradient: 'bg-gradient-to-br from-orange-400 to-orange-500',
    shadow: 'shadow-lg shadow-orange-500/25',
    miniBg: 'bg-white/20',
  },
  red: {
    gradient: 'bg-gradient-to-br from-rose-400 to-rose-500',
    shadow: 'shadow-lg shadow-rose-500/25',
    miniBg: 'bg-white/20',
  },
  slate: {
    gradient: 'bg-gradient-to-br from-slate-500 to-slate-600',
    shadow: 'shadow-lg shadow-slate-500/25',
    miniBg: 'bg-white/20',
  },
};

export function EdukaStatCard({
  label,
  value,
  accent = 'blue',
  icon,
  miniLabel,
  miniValue,
}: {
  label: string;
  value: number | string;
  accent?: EdukaAccent;
  icon: ReactNode;
  miniLabel?: string;
  miniValue?: number | string;
}) {
  const styles = ACCENTS[accent];

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl ${styles.gradient} p-5 text-white ${styles.shadow} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
    >
      {/* Glass sheen overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5" />

      {/* Top row: label + icon */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-white/95">{label}</div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="relative mt-3 text-3xl font-bold tracking-tight">
        {value}
      </div>

      {/* Bottom mini-metric */}
      {(miniLabel || miniValue !== undefined) && (
        <div
          className={`relative mt-4 flex items-center justify-between rounded-lg ${styles.miniBg} backdrop-blur-sm px-3 py-2 text-xs`}
        >
          <span className="text-white/90">{miniLabel ?? ''}</span>
          <span className="font-semibold">{miniValue ?? ''}</span>
        </div>
      )}

      {/* Decorative circle */}
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/15" />
    </div>
  );
}