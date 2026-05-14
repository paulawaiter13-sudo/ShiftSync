export type ShellNavId =
  | 'alerts'
  | 'investigations'
  | 'incidents'
  | 'handover'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeNav: ShellNavId;
  onNavSelect: (id: ShellNavId) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navPrimary: { id: ShellNavId; label: string; disabled?: boolean }[] = [
  { id: 'alerts', label: 'Alerts' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'incidents', label: 'Incidents' }
];

const navSecondary: { id: ShellNavId; label: string; disabled?: boolean }[] = [
  { id: 'handover', label: 'Handover', disabled: true },
  { id: 'reports', label: 'Reports', disabled: true },
  { id: 'settings', label: 'Settings', disabled: true }
];

function NavButton({
  id,
  label,
  active,
  disabled,
  onSelect
}: {
  id: ShellNavId;
  label: string;
  active: boolean;
  disabled?: boolean;
  onSelect: (id: ShellNavId) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? 'Coming soon' : undefined}
      onClick={() => !disabled && onSelect(id)}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium leading-snug transition sm:gap-3 sm:px-3 sm:py-2 sm:text-sm ${
        disabled
          ? 'cursor-not-allowed text-ops-muted/35'
          : active
            ? 'bg-ops-elevated text-ops-foreground shadow-card'
            : 'text-ops-muted hover:bg-ops-panel hover:text-ops-foreground'
      } `}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          active && !disabled ? 'bg-state-open' : 'bg-ops-border'
        }`}
      />
      {label}
    </button>
  );
}

export function Sidebar({ activeNav, onNavSelect, mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(20rem,100vw)] max-w-[20rem] shrink-0 flex-col border-r border-ops-border bg-ops-panel shadow-shell transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[260px] lg:max-w-none lg:translate-x-0 xl:w-[272px] ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ops-border px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ops-border bg-ops-elevated shadow-card sm:h-9 sm:w-9">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-state-open sm:h-5 sm:w-5" fill="currentColor" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9L2 16l10 5 10-5-10-5z" opacity="0.9" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-ops-foreground">ShiftSync</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ops-muted sm:text-2xs">
              NOC / Operations
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-ops-border text-ops-muted transition hover:bg-ops-elevated hover:text-ops-foreground lg:hidden"
          aria-label="Close navigation"
          onClick={onMobileClose}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3 scrollbar-thin sm:px-3 sm:py-4">
        <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:px-3 sm:text-2xs">
          Workspace
        </p>
        {navPrimary.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            label={item.label}
            active={activeNav === item.id}
            disabled={item.disabled}
            onSelect={onNavSelect}
          />
        ))}

        <p className="mt-5 px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:px-3 sm:text-2xs">
          Program
        </p>
        {navSecondary.map((item) => (
          <NavButton
            key={item.id}
            id={item.id}
            label={item.label}
            active={activeNav === item.id}
            disabled={item.disabled}
            onSelect={onNavSelect}
          />
        ))}
      </nav>

      <div className="mt-auto border-t border-ops-border p-3 sm:p-4">
        <div className="rounded-lg border border-ops-border bg-ops-elevated/80 p-2.5 shadow-card sm:p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">Desk</p>
          <p className="mt-0.5 text-xs font-semibold text-ops-foreground sm:text-sm">Core operations</p>
          <p className="mt-1 text-[11px] leading-snug text-ops-muted sm:text-xs">Alerts, incidents, and shift context.</p>
        </div>
      </div>
    </aside>
  );
}
