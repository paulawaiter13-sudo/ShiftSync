import type { Incident } from '../../types/incident';
import { IncidentBadge } from '../IncidentBadge';
import { StatusBadge } from '../StatusBadge';

const rowClass =
  'flex cursor-pointer items-start gap-3 rounded-lg border border-ops-border bg-ops-canvas/40 px-3 py-2.5 transition hover:border-sev-critical/25 hover:bg-ops-elevated/40';

interface SuggestedIncidentsSelectorProps {
  incidents: Incident[];
  selectedIds: Set<string>;
  onToggle: (incidentId: string, selected: boolean) => void;
}

export function SuggestedIncidentsSelector({
  incidents,
  selectedIds,
  onToggle
}: SuggestedIncidentsSelectorProps) {
  if (incidents.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-ops-border bg-ops-canvas/30 px-4 py-6 text-center text-sm text-ops-muted">
        No open incidents in suggested states. Add incidents from the list when they appear, or complete this section
        later.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {incidents.map((incident) => {
        const checked = selectedIds.has(incident.id);
        const isOpen = incident.status === 'Open';
        return (
          <label
            key={incident.id}
            className={`${rowClass} ${isOpen ? 'ring-1 ring-inset ring-state-open/20' : ''}`}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-ops-border text-state-open focus:ring-state-open/40"
              checked={checked}
              onChange={(e) => onToggle(incident.id, e.target.checked)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-ops-foreground">{incident.title}</p>
                <IncidentBadge type="severity" value={incident.severity} compact />
                <StatusBadge domain="incident" status={incident.status} size="xs" />
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] text-ops-muted">{incident.description}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-ops-muted">
                {incident.affectedService}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
