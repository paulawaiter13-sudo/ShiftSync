import type { Incident } from '../types/incident';
import { IncidentBadge } from './IncidentBadge';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface IncidentsTableProps {
  incidents: Incident[];
  onSelect: (incidentId: string) => void;
}

export function IncidentsTable({ incidents, onSelect }: IncidentsTableProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-red-200/70 bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-red-950 text-left text-xs uppercase tracking-[0.2em] text-red-100">
            <tr>
              <th className="px-5 py-4 font-medium">ID</th>
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-5 py-4 font-medium">Service</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Severity</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Assigned To</th>
              <th className="px-5 py-4 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => onSelect(incident.id)}
                className="cursor-pointer border-t border-red-100 text-sm text-slate-700 transition hover:bg-red-50/60"
              >
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{incident.id.slice(-8)}</td>
                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-ink">{incident.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{incident.reportedBy}</p>
                  </div>
                </td>
                <td className="px-5 py-4">{incident.affectedService}</td>
                <td className="px-5 py-4">{incident.category}</td>
                <td className="px-5 py-4">
                  <IncidentBadge type="severity" value={incident.severity} />
                </td>
                <td className="px-5 py-4">
                  <IncidentBadge type="status" value={incident.status} />
                </td>
                <td className="px-5 py-4">{incident.assignedTo ?? 'Unassigned'}</td>
                <td className="px-5 py-4 text-slate-600">
                  {dateFormatter.format(new Date(incident.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
