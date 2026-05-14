import type { Incident } from '../types/incident';
import { DataTable } from './DataTable';
import { IncidentBadge } from './IncidentBadge';

const timeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface IncidentsTableProps {
  incidents: Incident[];
  onSelect: (incidentId: string) => void;
}

const th = 'whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:px-3.5';
const td = 'px-3 py-1.5 align-middle sm:px-3.5 sm:py-2';

export function IncidentsTable({ incidents, onSelect }: IncidentsTableProps) {
  return (
    <DataTable className="ring-1 ring-sev-critical/12">
      <table className="min-w-[42rem] w-full border-collapse text-left text-[13px] leading-snug text-ops-foreground sm:min-w-[50rem]">
        <thead className="sticky top-0 z-10 border-b border-ops-border bg-ops-elevated/95 text-ops-muted shadow-[0_1px_0_0_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <tr>
            <th className={th}>Incident</th>
            <th className={`${th} hidden sm:table-cell`}>Service</th>
            <th className={`${th} hidden md:table-cell`}>Category</th>
            <th className={th}>Severity</th>
            <th className={th}>Status</th>
            <th className={`${th} hidden lg:table-cell`}>Owner</th>
            <th className={`${th} hidden sm:table-cell`}>Opened</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident, index) => {
            const isCritical = incident.severity === 'Critical';
            return (
              <tr
                key={incident.id}
                tabIndex={0}
                role="button"
                aria-label={`Open incident ${incident.title}`}
                onClick={() => onSelect(incident.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(incident.id);
                  }
                }}
                className={`cursor-pointer border-b border-ops-border outline-none transition-colors hover:bg-ops-elevated/55 focus-visible:bg-ops-elevated/55 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sev-critical/35 ${
                  index % 2 === 1 && !isCritical ? 'bg-ops-canvas/[0.22]' : ''
                } ${isCritical ? 'shadow-[inset_2px_0_0_0_#EF4444] bg-[linear-gradient(90deg,rgba(239,68,68,0.12),transparent_42%)]' : ''}`}
              >
                <td className={td}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ops-foreground" title={incident.title}>
                      {incident.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tabular-nums text-ops-muted/90">
                      {incident.id.slice(-8)}
                    </p>
                  </div>
                </td>
                <td className={`${td} hidden text-ops-muted sm:table-cell`}>
                  <span className="line-clamp-1" title={incident.affectedService}>
                    {incident.affectedService}
                  </span>
                </td>
                <td className={`${td} hidden text-ops-muted md:table-cell`}>
                  {incident.category}
                </td>
                <td className={td}>
                  <IncidentBadge type="severity" value={incident.severity} compact />
                </td>
                <td className={td}>
                  <IncidentBadge type="status" value={incident.status} compact />
                </td>
                <td className={`${td} hidden text-ops-muted lg:table-cell`}>
                  {incident.assignedTo ?? '—'}
                </td>
                <td className={`${td} hidden font-mono text-[11px] tabular-nums text-ops-muted sm:table-cell`}>
                  {timeFmt.format(new Date(incident.createdAt))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTable>
  );
}
