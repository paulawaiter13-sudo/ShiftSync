import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { IncidentsTable } from '../components/IncidentsTable';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { fetchIncidents } from '../services/incidents';
import { IncidentsCommandHeader } from '../sections/incidents/IncidentsCommandHeader';
import type { Incident } from '../types/incident';

interface IncidentsDashboardPageProps {
  onSelectIncident: (incidentId: string) => void;
}

export function IncidentsDashboardPage({ onSelectIncident }: IncidentsDashboardPageProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchIncidents({
      status: '',
      severity: '',
      category: ''
    })
      .then((response) => {
        if (isMounted) {
          setIncidents(response.data);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load incidents');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          label="Open incidents"
          value={kpis.openCount}
          helper="Open, investigating, or monitoring — needs ownership."
          tone="critical"
        />
        <KpiCard
          label="Critical"
          value={kpis.criticalCount}
          helper="Severest tier in the current dataset."
          tone="critical"
        />
        <KpiCard
          label="Resolved today"
          value={kpis.resolvedTodayCount}
          helper="Marked resolved with timestamp today."
          tone="positive"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No incidents on the board"
          description="Declared incidents from alert investigations will surface here. The alert stream remains the upstream intake."
        />
      ) : (
        <IncidentsTable incidents={incidents} onSelect={onSelectIncident} />
      )}
    </div>
  );
}
