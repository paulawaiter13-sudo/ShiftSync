import type { AlertSeverity, AlertStatus } from '../types/alert';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

interface BadgeProps {
  type: 'severity' | 'status';
  value: AlertSeverity | AlertStatus;
}

export function Badge({ type, value }: BadgeProps) {
  if (type === 'severity') {
    return <SeverityBadge severity={value as AlertSeverity} />;
  }
  return <StatusBadge domain="alert" status={value as AlertStatus} />;
}
