import type { PropsWithChildren, ReactNode } from 'react';

const padClass = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  dense: 'p-3 md:p-4'
};

interface SectionCardProps extends PropsWithChildren {
  className?: string;
  padding?: keyof typeof padClass;
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function SectionCard({
  children,
  className = '',
  padding = 'md',
  eyebrow,
  title,
  description,
  action
}: SectionCardProps) {
  const hasHeader = Boolean(eyebrow || title || description || action);

  return (
    <section
      className={`rounded-lg border border-ops-border bg-ops-panel shadow-card transition-shadow hover:shadow-card-hover ${className}`}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-2 border-b border-ops-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-3.5">
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ops-muted sm:text-2xs">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-0.5 text-base font-semibold leading-snug tracking-tight text-ops-foreground sm:text-[17px]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-ops-muted sm:text-[13px]">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
        </div>
      ) : null}
      <div className={padClass[padding]}>{children}</div>
    </section>
  );
}
