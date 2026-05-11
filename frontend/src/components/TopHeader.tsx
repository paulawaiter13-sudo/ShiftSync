const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

export function TopHeader() {
  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-line/80 bg-panel/90 px-6 py-5 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.35em] text-accentDark/70">
          Stage 1
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">
          Alert intake and triage
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Raw incoming signals from observability, security, and partner systems.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-slate-700">
        <span className="h-2.5 w-2.5 rounded-full bg-success" />
        Shift synced at {timestampFormatter.format(new Date())}
      </div>
    </header>
  );
}
