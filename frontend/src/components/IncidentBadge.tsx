import type { AlertSeverity } from '../types/alert';
import type { IncidentStatus } from '../types/incident';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

interface IncidentBadgeProps {
  type: 'severity' | 'status';
  value: AlertSeverity | IncidentStatus;
  /** Table / dense layouts */
  compact?: boolean;
}

export function IncidentBadge({ type, value, compact = false }: IncidentBadgeProps) {
  const size = compact ? 'xs' : 'md';
  if (type === 'severity') {
    return <SeverityBadge severity={value as AlertSeverity} size={size} />;
  }
  return <StatusBadge domain="incident" status={value as IncidentStatus} size={size} />;
}
