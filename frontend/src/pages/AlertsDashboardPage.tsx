import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from 'react';
import { AlertsTable } from '../components/AlertsTable';
import { EmptyState } from '../components/EmptyState';
import { FilterBar } from '../components/FilterBar';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { NewAlertModal } from '../components/NewAlertModal';
import { createAlert, fetchAlerts } from '../services/alerts';
import { AlertsDashboardHero } from '../sections/alerts/AlertsDashboardHero';
import type { Alert, AlertFilters, CreateAlertPayload } from '../types/alert';

const initialFilters: AlertFilters = {
  search: '',
  status: '',
  severity: '',
  source: ''
};

interface AlertsDashboardPageProps {
  onSelectAlert: (alertId: string) => void;
}

export function AlertsDashboardPage({ onSelectAlert }: AlertsDashboardPageProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filters, setFilters] = useState<AlertFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAlerts({
        status: filters.status,
        severity: filters.severity,
        source: filters.source,
        search: deferredSearch
      });
      setAlerts(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, [deferredSearch, filters.severity, filters.source, filters.status]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const sourceOptions = useMemo(
    () => Array.from(new Set(alerts.map((alert) => alert.source))).sort(),
    [alerts]
  );

  const todayStr = new Date().toDateString();

  const kpis = useMemo(
    () => ({
      active: alerts.filter((a) => a.status !== 'Closed').length,
      critical: alerts.filter((a) => a.severity === 'Critical').length,
      investigating: alerts.filter((a) => a.status === 'Investigating').length,
      resolvedToday: alerts.filter(
        (a) => a.status === 'Closed' && new Date(a.updatedAt).toDateString() === todayStr
      ).length
    }),
    [alerts, todayStr]
  );

  const handleFilterChange = (field: keyof AlertFilters, value: string) => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [field]: value as AlertFilters[typeof field]
      }));
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setFilters(initialFilters);
    });
  };

  const handleCreateAlert = async (payload: CreateAlertPayload) => {
    await createAlert(payload);
    await loadAlerts();
  };

  return (
    <>
      <div className="space-y-4">
        <AlertsDashboardHero onNewAlert={() => setIsModalOpen(true)} />

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          <KpiCard
            label="Active alerts"
            value={kpis.active}
            helper="Non-closed items in the current result set."
            tone="neutral"
          />
          <KpiCard
            label="Critical"
            value={kpis.critical}
            helper="Highest severity in view — prioritize triage."
            tone="critical"
          />
          <KpiCard
            label="Investigating"
            value={kpis.investigating}
            helper="Under active operator analysis."
            tone="warning"
          />
          <KpiCard
            label="Resolved today"
            value={kpis.resolvedToday}
            helper="Closed today (by last update timestamp)."
            tone="positive"
          />
        </div>

        <FilterBar
          filters={filters}
          sourceOptions={sourceOptions}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {error ? (
          <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No alerts in this view"
            description="Adjust filters or clear search to widen the stream. New signals appear here as soon as they hit the API."
          />
        ) : (
          <AlertsTable alerts={alerts} onSelect={onSelectAlert} />
        )}
      </div>

      <NewAlertModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAlert}
      />
    </>
  );
}
