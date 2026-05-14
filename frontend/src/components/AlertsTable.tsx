import type { Alert } from '../types/alert';
import { DataTable } from './DataTable';
import { ServiceIcon } from './ServiceIcon';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';

const timeFmt = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface AlertsTableProps {
  alerts: Alert[];
  onSelect: (alertId: string) => void;
}

const th = 'whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:px-3.5';
const td = 'px-3 py-1.5 align-middle sm:px-3.5 sm:py-2';

export function AlertsTable({ alerts, onSelect }: AlertsTableProps) {
  return (
    <DataTable>
      <table className="min-w-[44rem] w-full border-collapse text-left text-[13px] leading-snug text-ops-foreground sm:min-w-[52rem] sm:text-[13px]">
        <thead className="sticky top-0 z-10 border-b border-ops-border bg-ops-elevated/95 text-ops-muted shadow-[0_1px_0_0_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <tr>
            <th className={th}>Alert</th>
            <th className={`${th} hidden sm:table-cell`}>Service</th>
            <th className={`${th} hidden lg:table-cell`}>Source</th>
            <th className={th}>Severity</th>
            <th className={th}>Status</th>
            <th className={`${th} hidden sm:table-cell`}>Triggered</th>
            <th className={`${th} w-px text-right`} />
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, index) => (
            <tr
              key={alert.id}
              tabIndex={0}
              role="button"
              aria-label={`Open alert ${alert.title}`}
              className={`cursor-pointer border-b border-ops-border outline-none transition-colors hover:bg-ops-elevated/50 focus-visible:bg-ops-elevated/50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-state-open/40 ${
                index % 2 === 1 ? 'bg-ops-canvas/[0.22]' : ''
              }`}
              onClick={() => onSelect(alert.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(alert.id);
                }
              }}
            >
              <td className={td}>
                <div className="flex items-start gap-2 sm:gap-2.5">
                  <ServiceIcon name={alert.service} className="!h-7 !w-7 sm:!h-8 sm:!w-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ops-foreground" title={alert.title}>
                      {alert.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tabular-nums text-ops-muted/90">{alert.id.slice(-8)}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-ops-muted sm:hidden">{alert.description}</p>
                  </div>
                </div>
              </td>
              <td className={`${td} hidden text-ops-muted sm:table-cell`}>
                <span className="line-clamp-1" title={alert.service}>
                  {alert.service}
                </span>
              </td>
              <td className={`${td} hidden text-ops-muted lg:table-cell`}>
                <span className="line-clamp-1 font-mono text-[12px]" title={alert.source}>
                  {alert.source}
                </span>
              </td>
              <td className={td}>
                <SeverityBadge severity={alert.severity} size="xs" />
              </td>
              <td className={td}>
                <StatusBadge domain="alert" status={alert.status} size="xs" />
              </td>
              <td className={`${td} hidden font-mono text-[11px] tabular-nums text-ops-muted sm:table-cell`}>
                {timeFmt.format(new Date(alert.triggeredAt))}
              </td>
              <td className={`${td} text-right`}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(alert.id);
                  }}
                  className="rounded border border-ops-border bg-ops-canvas px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ops-foreground transition hover:border-state-open/45 hover:bg-ops-elevated sm:px-2.5 sm:text-2xs"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
