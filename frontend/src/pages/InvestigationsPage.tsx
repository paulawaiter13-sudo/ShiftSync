import { useCallback, useEffect, useState } from 'react';
import { AlertsTable } from '../components/AlertsTable';
import { EmptyState } from '../components/EmptyState';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { fetchAlerts } from '../services/alerts';
import type { Alert } from '../types/alert';

interface InvestigationsPageProps {
  onSelectAlert: (alertId: string) => void;
}

export function InvestigationsPage({ onSelectAlert }: InvestigationsPageProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAlerts({
        search: '',
        status: 'Investigating',
        severity: '',
        source: ''
      });
      setAlerts(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load investigations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;

  return (
    <div className="space-y-4">
      <div className="border-b border-ops-border pb-4">
        <p className="text-2xs font-bold uppercase tracking-widest text-state-investigating">Stage 2</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">
          Investigations
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ops-muted">
          Active investigations — alerts with status Investigating. Open a row for notes, status updates, and
          incident declaration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-2">
        <KpiCard
          label="Investigating"
          value={alerts.length}
          helper="Alerts currently in Investigating status."
          tone="warning"
        />
        <KpiCard
          label="Critical"
          value={criticalCount}
          helper="Highest severity in this queue."
          tone="critical"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No active investigations"
          description="Alerts appear here when their status is set to Investigating from the alerts dashboard or during incident declaration."
        />
      ) : (
        <AlertsTable alerts={alerts} onSelect={onSelectAlert} />
      )}
    </div>
  );
}
