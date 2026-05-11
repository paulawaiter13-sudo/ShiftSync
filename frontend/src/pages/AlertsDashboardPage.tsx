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

  const kpis = useMemo(
    () => ({
      total: alerts.length,
      newCount: alerts.filter((alert) => alert.status === 'New').length,
      critical: alerts.filter((alert) => alert.severity === 'Critical').length,
      investigating: alerts.filter((alert) => alert.status === 'Investigating').length
    }),
    [alerts]
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
        <section className="rounded-[28px] border border-line/80 bg-panel px-6 py-6 shadow-panel">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-heading text-xs uppercase tracking-[0.35em] text-accentDark/70">
                Alerts Dashboard
              </p>
              <h1 className="mt-2 font-heading text-4xl font-semibold text-ink">
                Live alert intake
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Review raw operational signals, isolate noise from action-worthy events, and keep
                an auditable record for the shift without promoting every alert to an incident.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark"
            >
              Log New Alert
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Alerts"
            value={kpis.total}
            helper="Current result set after filters"
            accentClass="bg-ink"
          />
          <KpiCard
            label="New Alerts"
            value={kpis.newCount}
            helper="Unacknowledged incoming signals"
            accentClass="bg-sky-500"
          />
          <KpiCard
            label="Critical Alerts"
            value={kpis.critical}
            helper="Highest-severity conditions in view"
            accentClass="bg-danger"
          />
          <KpiCard
            label="Investigating Alerts"
            value={kpis.investigating}
            helper="Alerts already under active triage"
            accentClass="bg-accent"
          />
        </section>

        <FilterBar
          filters={filters}
          sourceOptions={sourceOptions}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {error ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger shadow-panel">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingState />
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No alerts match the current filters"
            description="Try broadening the search or clearing one of the selected filters to bring the alert stream back into view."
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
