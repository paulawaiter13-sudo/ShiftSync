import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { HandoverStatusBadge } from '../components/handover/HandoverStatusBadge';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { fetchHandovers } from '../services/handoverService';
import type { HandoverListFilters, HandoverListRow, HandoverStatus, ShiftType } from '../types/handover';
import { HANDOVER_STATUSES, SHIFT_TYPES } from '../types/handover';

const th = 'whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:px-3.5';
const td = 'px-3 py-1.5 align-middle sm:px-3.5 sm:py-2';

const defaultFilters: HandoverListFilters = {
  status: '',
  shiftType: '',
  shiftDate: ''
};

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

const createdFmt = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface HandoversPageProps {
  onCreate: () => void;
  onView: (handoverId: string) => void;
  onEdit: (handoverId: string) => void;
}

export function HandoversPage({ onCreate, onView, onEdit }: HandoversPageProps) {
  const [rows, setRows] = useState<HandoverListRow[]>([]);
  const [stats, setStats] = useState<{
    draftCount: number;
    readyCount: number;
    completedTodayCount: number;
    openFollowUpCount: number;
  } | null>(null);
  const [filters, setFilters] = useState<HandoverListFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchHandovers(filters);
      setRows(res.data);
      setStats(res.meta.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load handovers');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFilter = (field: keyof HandoverListFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: field === 'status' ? (value as HandoverStatus | '') : field === 'shiftType' ? (value as ShiftType | '') : value
    }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const kpis = useMemo(() => {
    if (!stats) {
      return {
        draft: 0,
        ready: 0,
        completedToday: 0,
        openFollowUps: 0
      };
    }
    return {
      draft: stats.draftCount,
      ready: stats.readyCount,
      completedToday: stats.completedTodayCount,
      openFollowUps: stats.openFollowUpCount
    };
  }, [stats]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 border-b border-ops-border pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-2xs font-bold uppercase tracking-widest text-state-open">Stage 4</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">Shift Handovers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ops-muted">
            Review and prepare operational context for the next shift. Structured summaries reduce surprise and speed up
            ownership.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-state-open/40 bg-state-open/15 px-4 py-2.5 text-sm font-semibold text-state-open shadow-card transition hover:bg-state-open/25"
        >
          Create Handover
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        <KpiCard
          label="Draft Handovers"
          value={kpis.draft}
          helper="In progress — not yet ready for turnover."
          tone="warning"
        />
        <KpiCard
          label="Ready Handovers"
          value={kpis.ready}
          helper="Summary complete — ready for sign-off."
          tone="info"
        />
        <KpiCard
          label="Completed Today"
          value={kpis.completedToday}
          helper="Signed off handovers with completion timestamp today (UTC)."
          tone="positive"
        />
        <KpiCard
          label="Open Follow-ups"
          value={kpis.openFollowUps}
          helper="Tracked items still open or in progress across all handovers."
          tone="critical"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-ops-border bg-ops-panel/60 p-3 shadow-card sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[10rem] flex-1">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Status</span>
          <select
            className="w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-sm outline-none focus:border-state-open/45"
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            <option value="">All</option>
            {HANDOVER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[10rem] flex-1">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Shift type</span>
          <select
            className="w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-sm outline-none focus:border-state-open/45"
            value={filters.shiftType}
            onChange={(e) => handleFilter('shiftType', e.target.value)}
          >
            <option value="">All</option>
            {SHIFT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[10rem] flex-1">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Shift date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-sm font-mono outline-none focus:border-state-open/45"
            value={filters.shiftDate}
            onChange={(e) => handleFilter('shiftDate', e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-ops-muted transition hover:text-ops-foreground"
        >
          Reset filters
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No handovers match"
          description="Create a handover to capture alerts, incidents, and follow-ups for the next operator."
        />
      ) : (
        <DataTable>
          <table className="min-w-[56rem] w-full border-collapse text-left text-[13px] leading-snug text-ops-foreground">
            <thead className="sticky top-0 z-10 border-b border-ops-border bg-ops-elevated/95 text-ops-muted backdrop-blur-sm">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Shift date</th>
                <th className={th}>Shift type</th>
                <th className={`${th} hidden md:table-cell`}>Created by</th>
                <th className={th}>Status</th>
                <th className={`${th} text-center`}>Alerts</th>
                <th className={`${th} text-center`}>Incidents</th>
                <th className={`${th} text-center`}>Follow-ups</th>
                <th className={`${th} hidden lg:table-cell`}>Created at</th>
                <th className={`${th} w-px text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-ops-border ${
                    index % 2 === 1 ? 'bg-ops-canvas/[0.22]' : ''
                  }`}
                >
                  <td className={td}>
                    <span className="font-mono text-xs tabular-nums text-ops-muted">{row.id.slice(-8)}</span>
                  </td>
                  <td className={`${td} font-mono text-xs tabular-nums`}>{dateFmt.format(new Date(row.shiftDate))}</td>
                  <td className={td}>{row.shiftType}</td>
                  <td className={`${td} hidden md:table-cell`}>{row.createdBy}</td>
                  <td className={td}>
                    <HandoverStatusBadge status={row.status} />
                  </td>
                  <td className={`${td} text-center font-mono text-xs tabular-nums`}>{row.counts.alerts}</td>
                  <td className={`${td} text-center font-mono text-xs tabular-nums`}>{row.counts.incidents}</td>
                  <td className={`${td} text-center font-mono text-xs tabular-nums`}>{row.counts.followUps}</td>
                  <td className={`${td} hidden font-mono text-xs tabular-nums text-ops-muted lg:table-cell`}>
                    {createdFmt.format(new Date(row.createdAt))}
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(row.id)}
                        className="rounded-md border border-ops-border px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ops-muted transition hover:text-ops-foreground"
                      >
                        View
                      </button>
                      {row.status === 'Draft' || row.status === 'Ready' ? (
                        <button
                          type="button"
                          onClick={() => onEdit(row.id)}
                          className="rounded-md border border-state-open/35 bg-state-open/10 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-state-open transition hover:bg-state-open/20"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}
    </div>
  );
}
