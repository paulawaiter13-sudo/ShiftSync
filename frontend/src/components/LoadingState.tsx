export function LoadingState() {
  return (
    <div className="rounded-[28px] border border-line/80 bg-panel p-6 shadow-panel">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
          />
        ))}
      </div>
    </div>
  );
}
