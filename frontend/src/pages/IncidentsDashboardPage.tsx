import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { IncidentFiltersBar } from '../components/IncidentFiltersBar';
import { IncidentsTable } from '../components/IncidentsTable';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { fetchIncidents } from '../services/incidents';
import { IncidentsCommandHeader } from '../sections/incidents/IncidentsCommandHeader';
import type { Incident, IncidentFilters } from '../types/incident';

const defaultFilters: IncidentFilters = {
  status: '',
  severity: '',
  category: ''
};

interface IncidentsDashboardPageProps {
  onSelectIncident: (incidentId: string) => void;
}

export function IncidentsDashboardPage({ onSelectIncident }: IncidentsDashboardPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filters, setFilters] = useState<IncidentFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchIncidents(filters);
      setIncidents(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load incidents');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  const handleFilterChange = (field: keyof IncidentFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const kpis = useMemo(() => {
    const today = new Date().toDateString();

    return {
      openCount: incidents.filter((incident) =>
        ['Open', 'Investigating', 'Monitoring'].includes(incident.status)
      ).length,
      criticalCount: incidents.filter((incident) => incident.severity === 'Critical').length,
      resolvedTodayCount: incidents.filter(
        (incident) => incident.resolvedAt && new Date(incident.resolvedAt).toDateString() === today
      ).length
    };
  }, [incidents]);

  return (
    <div className="space-y-4">
      <IncidentsCommandHeader />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        <KpiCard
          label="Open Incidents"
          value={kpis.openCount}
          helper="Open, investigating, or monitoring — needs ownership."
          tone="critical"
        />
        <KpiCard
          label="Critical Incidents"
          value={kpis.criticalCount}
          helper="Severest tier in the current filtered set."
          tone="critical"
        />
        <KpiCard
          label="Resolved Today"
          value={kpis.resolvedTodayCount}
          helper="Marked resolved with a timestamp today."
          tone="positive"
        />
      </div>

      <IncidentFiltersBar filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No incidents match these filters"
          description="Confirmed operational incidents appear here after declaration from an alert or manual creation. Adjust filters or declare an incident from an alert investigation."
        />
      ) : (
        <IncidentsTable incidents={incidents} onSelect={onSelectIncident} />
      )}
    </div>
  );
}
