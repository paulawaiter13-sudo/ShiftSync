import { SectionCard } from '../../components/SectionCard';

interface AlertsDashboardHeroProps {
  onNewAlert: () => void;
}

export function AlertsDashboardHero({ onNewAlert }: AlertsDashboardHeroProps) {
  return (
    <SectionCard
      padding="none"
      eyebrow="Alerts"
      title="Live operations stream"
      description="Triage signals, document investigation, promote validated issues to incidents. Layout is tuned for dense scanning on wide monitors."
      action={
        <button
          type="button"
          onClick={onNewAlert}
          className="h-8 whitespace-nowrap rounded-md bg-state-open px-3 text-xs font-semibold text-white shadow-card transition hover:brightness-110 active:brightness-95 sm:h-9 sm:px-3.5 sm:text-[13px]"
        >
          Log alert
        </button>
      }
    />
  );
}
