import { StatusBadge } from '../../components/StatusBadge';

export function IncidentsCommandHeader() {
  return (
    <div className="rounded-lg border border-sev-critical/20 bg-[linear-gradient(135deg,rgba(239,68,68,0.1),transparent_52%)] p-3 shadow-card sm:p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sev-critical sm:text-2xs">
            Incident command
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-ops-foreground sm:text-2xl">
            Incidents
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-ops-muted sm:text-[13px]">
            Confirmed operational incidents only — declared after investigation when impact is critical
            or operationally significant. Upstream alert intake stays separate on the Alerts board.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 rounded-md border border-ops-border bg-ops-panel/90 px-3 py-2 shadow-card sm:min-w-[12rem] sm:px-3.5 sm:py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">
            Posture
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge domain="incident" status="Investigating" size="xs" />
            <span className="text-xs font-medium text-ops-foreground sm:text-[13px]">Critical lane</span>
          </div>
        </div>
      </div>
    </div>
  );
}
