import type { AlertSeverity } from '../types/alert';

const severityClass: Record<AlertSeverity, string> = {
  Critical:
    'border-sev-critical/40 bg-sev-critical/10 text-sev-critical ring-1 ring-inset ring-sev-critical/20',
  High: 'border-sev-high/40 bg-sev-high/10 text-sev-high ring-1 ring-inset ring-sev-high/15',
  Medium:
    'border-sev-medium/45 bg-sev-medium/10 text-sev-medium ring-1 ring-inset ring-sev-medium/20',
  Low: 'border-sev-low/40 bg-sev-low/10 text-sev-low ring-1 ring-inset ring-sev-low/15'
};

const sizeMap = {
  xs: 'px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide',
  sm: 'px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide',
  md: 'px-2.5 py-1 text-xs font-semibold uppercase tracking-wide'
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
  size?: keyof typeof sizeMap;
}

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border ${sizeMap[size]} ${severityClass[severity]}`}
    >
      {severity}
    </span>
  );
}
