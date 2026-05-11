import type { AlertSeverity, AlertStatus } from '../types/alert';

const severityStyles: Record<AlertSeverity, string> = {
  Low: 'bg-slate-200 text-slate-700',
  Medium: 'bg-amber-100 text-warning',
  High: 'bg-orange-100 text-accentDark',
  Critical: 'bg-red-100 text-danger'
};

const statusStyles: Record<AlertStatus, string> = {
  New: 'bg-sky-100 text-sky-700',
  Acknowledged: 'bg-amber-100 text-warning',
  Investigating: 'bg-orange-100 text-accentDark',
  Closed: 'bg-emerald-100 text-success'
};

interface BadgeProps {
  type: 'severity' | 'status';
  value: AlertSeverity | AlertStatus;
}

export function Badge({ type, value }: BadgeProps) {
  const className =
    type === 'severity'
      ? severityStyles[value as AlertSeverity]
      : statusStyles[value as AlertStatus];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {value}
    </span>
  );
}
