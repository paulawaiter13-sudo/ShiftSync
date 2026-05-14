import type { PropsWithChildren } from 'react';

interface DataTableProps extends PropsWithChildren {
  className?: string;
}

export function DataTable({ children, className = '' }: DataTableProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-ops-border bg-ops-panel shadow-card ${className}`}
    >
      <div className="relative overflow-x-auto scrollbar-thin">
        {children}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-5 bg-gradient-to-l from-ops-panel from-40% to-transparent sm:w-6 md:hidden"
          aria-hidden
        />
      </div>
    </div>
  );
}
