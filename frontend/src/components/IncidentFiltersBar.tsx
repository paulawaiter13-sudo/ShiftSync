import { ALERT_SEVERITIES } from '../types/alert';
import type { IncidentFilters } from '../types/incident';
import { formatIncidentCategory, INCIDENT_CATEGORIES, INCIDENT_STATUSES } from '../types/incident';

const fieldClass =
  'h-9 w-full rounded-md border border-ops-border bg-ops-canvas px-2.5 text-[13px] text-ops-foreground outline-none transition placeholder:text-ops-muted/40 focus:border-sev-critical/40 focus:ring-1 focus:ring-sev-critical/20 sm:px-3';

interface IncidentFiltersBarProps {
  filters: IncidentFilters;
  onChange: (field: keyof IncidentFilters, value: string) => void;
  onReset: () => void;
}

export function IncidentFiltersBar({ filters, onChange, onReset }: IncidentFiltersBarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-0.5 mb-4 px-0.5 pt-0.5">
      <section className="rounded-lg border border-sev-critical/15 bg-ops-panel/95 px-3 py-3 shadow-card backdrop-blur-md sm:px-4 sm:py-3.5">
        <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2 sm:mb-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">
              Filters
            </p>
            <p className="mt-0.5 hidden text-xs text-ops-muted sm:block sm:text-[13px]">
              Narrow confirmed incidents — same filters as the API query string.
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
          <label className="flex flex-col gap-1 text-[11px] font-medium text-ops-muted sm:text-xs">
            Status
            <select
              value={filters.status}
              onChange={(event) => onChange('status', event.target.value)}
              className={fieldClass}
            >
              <option value="">All statuses</option>
              {INCIDENT_STATUSES.map((status) => (
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
            Category
            <select
              value={filters.category}
              onChange={(event) => onChange('category', event.target.value)}
              className={fieldClass}
            >
              <option value="">All categories</option>
              {INCIDENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatIncidentCategory(category)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </div>
  );
}
