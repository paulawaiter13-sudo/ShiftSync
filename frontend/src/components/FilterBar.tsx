import type { AlertFilters } from '../types/alert';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../types/alert';

const fieldClass =
  'h-9 w-full rounded-md border border-ops-border bg-ops-canvas px-2.5 text-[13px] text-ops-foreground outline-none transition placeholder:text-ops-muted/40 focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25 sm:px-3';

interface FilterBarProps {
  filters: AlertFilters;
  sourceOptions: string[];
  onChange: (field: keyof AlertFilters, value: string) => void;
  onReset: () => void;
}

export function FilterBar({ filters, sourceOptions, onChange, onReset }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-0.5 mb-4 px-0.5 pt-0.5">
      <section className="rounded-lg border border-ops-border bg-ops-panel/95 px-3 py-3 shadow-card backdrop-blur-md sm:px-4 sm:py-3.5">
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">Filters</p>
            <p className="mt-0.5 hidden text-xs text-ops-muted sm:block sm:text-[13px]">
              Refine the stream — results update the table below.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="h-9 shrink-0 rounded-md border border-ops-border px-3 text-2xs font-semibold text-ops-muted transition hover:border-ops-muted/50 hover:text-ops-foreground sm:text-xs"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-[2fr,1fr,1fr,1fr]">
          <label className="flex flex-col gap-1 text-[11px] font-medium text-ops-muted sm:text-xs">
            Search
            <input
              value={filters.search}
              onChange={(event) => onChange('search', event.target.value)}
              placeholder="Title, service, description…"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-medium text-ops-muted sm:text-xs">
            Status
            <select
              value={filters.status}
              onChange={(event) => onChange('status', event.target.value)}
              className={fieldClass}
            >
              <option value="">All statuses</option>
              {ALERT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-medium text-ops-muted sm:text-xs">
            Severity
            <select
              value={filters.severity}
              onChange={(event) => onChange('severity', event.target.value)}
              className={fieldClass}
            >
              <option value="">All severities</option>
              {ALERT_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[11px] font-medium text-ops-muted sm:text-xs">
            Source
            <select
              value={filters.source}
              onChange={(event) => onChange('source', event.target.value)}
              className={fieldClass}
            >
              <option value="">All sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}
