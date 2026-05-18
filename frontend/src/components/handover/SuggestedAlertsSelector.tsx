import type { Alert } from '../../types/alert';
import { SeverityBadge } from '../SeverityBadge';
import { StatusBadge } from '../StatusBadge';

const rowClass =
  'flex cursor-pointer items-start gap-3 rounded-lg border border-ops-border bg-ops-canvas/40 px-3 py-2.5 transition hover:border-state-open/30 hover:bg-ops-elevated/40';

interface SuggestedAlertsSelectorProps {
  alerts: Alert[];
  selectedIds: Set<string>;
  onToggle: (alertId: string, selected: boolean) => void;
}

export function SuggestedAlertsSelector({ alerts, selectedIds, onToggle }: SuggestedAlertsSelectorProps) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ops-border bg-ops-canvas/30 px-4 py-6 text-center text-sm text-ops-muted">
        No suggested alerts match the current shift criteria. You can still save a handover and attach alerts later.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const checked = selectedIds.has(alert.id);
        const isCritical = alert.severity === 'Critical';
        return (
          <label
            key={alert.id}
            className={`${rowClass} ${isCritical ? 'ring-1 ring-inset ring-sev-critical/25' : ''}`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-ops-border text-state-open focus:ring-state-open/40"
              checked={checked}
              onChange={(e) => onToggle(alert.id, e.target.checked)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-ops-foreground">{alert.title}</p>
                <SeverityBadge severity={alert.severity} size="xs" />
                <StatusBadge domain="alert" status={alert.status} size="xs" />
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-ops-muted">{alert.description}</p>
              <p className="mt-1 font-mono text-[10px] text-ops-muted/80">{alert.service}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
