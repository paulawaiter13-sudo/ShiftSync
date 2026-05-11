import type { Alert } from '../types/alert';
import { Badge } from './Badge';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface AlertsTableProps {
  alerts: Alert[];
  onSelect: (alertId: string) => void;
}

export function AlertsTable({ alerts, onSelect }: AlertsTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line/80 bg-panel shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-ink text-left text-xs uppercase tracking-[0.2em] text-orange-100">
            <tr>
              <th className="px-5 py-4 font-medium">ID</th>
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-5 py-4 font-medium">Service</th>
              <th className="px-5 py-4 font-medium">Source</th>
              <th className="px-5 py-4 font-medium">Severity</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Triggered At</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="cursor-pointer border-t border-line/70 text-sm text-slate-700 transition hover:bg-orange-50/40"
                onClick={() => onSelect(alert.id)}
              >
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{alert.id.slice(-8)}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{alert.title}</p>
                    <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                      {alert.description}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4">{alert.service}</td>
                <td className="px-5 py-4">{alert.source}</td>
                <td className="px-5 py-4">
                  <Badge type="severity" value={alert.severity} />
                </td>
                <td className="px-5 py-4">
                  <Badge type="status" value={alert.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {dateFormatter.format(new Date(alert.triggeredAt))}
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(alert.id);
                    }}
                    className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-accentDark"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
