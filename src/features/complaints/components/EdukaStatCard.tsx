import type { ReactNode } from 'react';

export type EdukaAccent =
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'red'
  | 'slate';

const ACCENTS: Record<
  EdukaAccent,
  { bg: string; text: string; miniBg: string }
> = {
  green: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    miniBg: 'bg-emerald-600/40',
  },
  blue: {
    bg: 'bg-sky-500',
    text: 'text-white',
    miniBg: 'bg-sky-600/40',
  },
  purple: {
    bg: 'bg-violet-500',
    text: 'text-white',
    miniBg: 'bg-violet-600/40',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    miniBg: 'bg-orange-600/40',
  },
  red: {
    bg: 'bg-rose-500',
    text: 'text-white',
    miniBg: 'bg-rose-600/40',
  },
  slate: {
    bg: 'bg-slate-600',
    text: 'text-white',
    miniBg: 'bg-slate-700/40',
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
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl ${styles.bg} p-5 ${styles.text} shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-white/90">{label}</div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>

      {/* Bottom mini-metric */}
      {(miniLabel || miniValue !== undefined) && (
        <div
          className={`mt-4 flex items-center justify-between rounded-lg ${styles.miniBg} px-3 py-2 text-xs`}
        >
          <span className="text-white/80">{miniLabel ?? ''}</span>
          <span className="font-semibold">{miniValue ?? ''}</span>
        </div>
      )}

      {/* Decorative circle */}
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
    </div>
  );
}