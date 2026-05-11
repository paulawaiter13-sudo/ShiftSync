import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { IncidentBadge } from '../components/IncidentBadge';
import { IncidentsTable } from '../components/IncidentsTable';
import { KpiCard } from '../components/KpiCard';
import { LoadingState } from '../components/LoadingState';
import { fetchIncidents } from '../services/incidents';
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
      <section className="rounded-[28px] border border-red-200/80 bg-white px-6 py-6 shadow-panel">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.35em] text-red-700/70">
              Incident Command
            </p>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-red-950">Incidents</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Confirmed production-impacting issues that have crossed the threshold from alert and
              investigation into a managed incident workflow.
            </p>
          </div>

          <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-red-700/70">Current Focus</p>
            <div className="mt-2 flex items-center gap-2">
              <IncidentBadge type="status" value="Investigating" />
              <span className="text-sm font-semibold text-red-950">Critical response lane</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Open Incidents"
          value={kpis.openCount}
          helper="Active issues across command channels"
          accentClass="bg-red-600"
        />
        <KpiCard
          label="Critical Incidents"
          value={kpis.criticalCount}
          helper="Highest-priority incident records"
          accentClass="bg-red-900"
        />
        <KpiCard
          label="Resolved Today"
          value={kpis.resolvedTodayCount}
          helper="Incidents moved into resolved state today"
          accentClass="bg-emerald-600"
        />
      </section>

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger shadow-panel">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : incidents.length === 0 ? (
        <EmptyState
          title="No incidents are active"
          description="Declared incidents will appear here once an alert investigation confirms a critical issue."
        />
      ) : (
        <IncidentsTable incidents={incidents} onSelect={onSelectIncident} />
      )}
    </div>
  );
}
