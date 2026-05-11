interface SidebarProps {
  activeView: 'alerts' | 'incidents';
  onNavigateToAlerts: () => void;
  onNavigateToIncidents: () => void;
}

export function Sidebar({
  activeView,
  onNavigateToAlerts,
  onNavigateToIncidents
}: SidebarProps) {
  return (
    <aside className="flex w-full max-w-[280px] flex-col rounded-[28px] border border-line/80 bg-ink px-6 py-7 text-white shadow-panel">
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.35em] text-orange-200/70">
          ShiftSync
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight">
          NOC operations board
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Track raw alerts through investigation, then escalate confirmed production issues into a
          dedicated incident command flow.
        </p>
      </div>

      <nav className="mt-10 space-y-3">
        <button
          type="button"
          onClick={onNavigateToAlerts}
          className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            activeView === 'alerts'
              ? 'bg-white/10 text-white'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          Alerts Dashboard
        </button>

        <button
          type="button"
          onClick={onNavigateToIncidents}
          className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
            activeView === 'incidents'
              ? 'bg-white/10 text-white'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          Incidents
        </button>

        <div className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-400">
          Shift Handover
        </div>
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-orange-200/70">Current Desk</p>
        <p className="mt-2 font-heading text-lg">EMEA Core Operations</p>
        <p className="mt-2 text-sm text-slate-300">
          Monitoring alert flow, service degradations, and security anomalies.
        </p>
      </div>
    </aside>
  );
}
