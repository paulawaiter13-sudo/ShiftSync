import type { AlertFilters } from '../types/alert';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../types/alert';

interface FilterBarProps {
  filters: AlertFilters;
  sourceOptions: string[];
  onChange: (field: keyof AlertFilters, value: string) => void;
  onReset: () => void;
}

export function FilterBar({ filters, sourceOptions, onChange, onReset }: FilterBarProps) {
  return (
    <section className="rounded-[28px] border border-line/80 bg-panel px-5 py-5 shadow-panel">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr,1fr,1fr,1fr,auto]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Search
          <input
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search title or service"
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          >
            <option value="">All statuses</option>
            {ALERT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Severity
          <select
            value={filters.severity}
            onChange={(event) => onChange('severity', event.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          >
            <option value="">All severities</option>
            {ALERT_SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Source
          <select
            value={filters.source}
            onChange={(event) => onChange('source', event.target.value)}
            className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent"
          >
            <option value="">All sources</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accentDark xl:w-auto"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
}
