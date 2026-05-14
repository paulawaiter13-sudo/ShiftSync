interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className = '' }: ServiceIconProps) {
  const letter = (name.trim().charAt(0) || '?').toUpperCase();

  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ops-border bg-ops-elevated text-xs font-bold uppercase text-ops-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
      aria-hidden
    >
      {letter}
    </span>
  );
}
