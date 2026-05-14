const timeFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short'
});

interface TopbarProps {
  context: 'alerts' | 'incidents';
  onOpenNavigation?: () => void;
}

export function Topbar({ context, onOpenNavigation }: TopbarProps) {
  const subtitle =
    context === 'incidents'
      ? 'Incident command — production-impacting workstreams'
      : 'Alert intake — triage and investigation before incident promotion';

  return (
    <header className="sticky top-0 z-30 flex min-h-[3rem] shrink-0 items-center gap-3 border-b border-ops-border bg-ops-canvas/95 px-3 py-2 backdrop-blur-md sm:min-h-[3.25rem] sm:px-4 lg:px-6">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ops-border bg-ops-panel text-ops-muted transition hover:border-ops-muted/40 hover:text-ops-foreground lg:hidden"
        aria-label="Open navigation"
        onClick={() => onOpenNavigation?.()}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-ops-border bg-ops-panel px-2.5 py-1.5 shadow-card sm:px-3">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sev-low shadow-[0_0_6px_rgba(34,197,94,0.55)]" />
          <span className="hidden text-2xs font-medium uppercase tracking-wide text-ops-muted sm:inline">
            Shift
          </span>
          <span className="truncate font-mono text-xs font-semibold tabular-nums text-ops-foreground sm:text-sm">
            {timeFmt.format(new Date())}
          </span>
        </div>

        <span className="shrink-0 rounded border border-sev-critical/30 bg-incident-glow px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sev-critical sm:text-2xs">
          PROD
        </span>

        <p className="hidden min-w-0 flex-1 text-xs leading-snug text-ops-muted md:block md:truncate lg:text-sm">
          {subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-ops-border bg-ops-panel text-ops-muted transition hover:border-ops-muted/40 hover:text-ops-foreground"
          aria-label="Notifications"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.082A9.587 9.587 0 0112 21.75a9.587 9.587 0 01-9.311-4.835 23.88 23.88 0 005.454 1.082M18 8a6 6 0 11-12 0v2.086c0 .173-.048.343-.137.49l-1.617 2.838A1.125 1.125 0 006.492 15h11.016a1.125 1.125 0 01-.992-1.585l-1.617-2.839a1.125 1.125 0 01-.137-.489V8z"
            />
          </svg>
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sev-critical ring-2 ring-ops-panel" />
        </button>

        <div className="flex items-center gap-1.5 rounded-md border border-ops-border bg-ops-panel py-0.5 pl-0.5 pr-2 shadow-card sm:gap-2 sm:py-1 sm:pl-1 sm:pr-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-ops-elevated text-2xs font-semibold text-ops-foreground">
            OP
          </span>
          <div className="hidden text-left sm:block">
            <p className="text-[10px] font-medium uppercase tracking-wide text-ops-muted">On shift</p>
            <p className="text-xs font-semibold leading-none text-ops-foreground">Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
