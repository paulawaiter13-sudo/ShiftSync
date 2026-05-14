export function LoadingState() {
  return (
    <div className="rounded-lg border border-ops-border bg-ops-panel p-3 shadow-card sm:p-4">
      <div className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-9 animate-pulse rounded-md bg-ops-elevated/70 sm:h-10" />
        ))}
      </div>
    </div>
  );
}
