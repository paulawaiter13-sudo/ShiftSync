import { useEffect, useState } from 'react';
import { IncidentBadge } from '../components/IncidentBadge';
import { fetchIncidentById, updateIncidentStatus } from '../services/incidents';
import type { Incident, IncidentStatus } from '../types/incident';
import { INCIDENT_STATUSES } from '../types/incident';

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface IncidentDetailsPageProps {
  incidentId: string;
  onBack: () => void;
  onOpenSourceAlert: (alertId: string) => void;
}

export function IncidentDetailsPage({
  incidentId,
  onBack,
  onOpenSourceAlert
}: IncidentDetailsPageProps) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>('Open');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchIncidentById(incidentId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setIncident(response.data);
        setSelectedStatus(response.data.status);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load incident');
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
  }, [incidentId]);

  const handleSaveStatus = async (status: IncidentStatus) => {
    if (!incident) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateIncidentStatus(incident.id, { status });
      setIncident(response.data);
      setSelectedStatus(response.data.status);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update incident');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-red-200/80 bg-white px-6 py-8 shadow-panel">
        <div className="h-12 w-52 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-6 h-52 animate-pulse rounded-[28px] bg-slate-200" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-sm text-danger shadow-panel">
        {error ?? 'Incident not found'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-red-200/80 bg-white px-6 py-6 shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-red-300 hover:text-red-800"
            >
              Back to Incidents
            </button>
            <p className="mt-5 font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
              Incident Record
            </p>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-red-950">
              {incident.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{incident.description}</p>
          </div>

          <div className="rounded-[24px] border border-red-100 bg-red-50 px-5 py-5 xl:min-w-[340px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700/70">
              Declared
            </p>
            <p className="mt-2 font-heading text-lg text-red-950">
              {timestampFormatter.format(new Date(incident.createdAt))}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <IncidentBadge type="severity" value={incident.severity} />
              <IncidentBadge type="status" value={incident.status} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr),minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <section className="rounded-[28px] border border-red-200/80 bg-white px-6 py-6 shadow-panel">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
              Metadata
            </p>
            <dl className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">Affected Service</dt>
                <dd className="mt-1">{incident.affectedService}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Category</dt>
                <dd className="mt-1">{incident.category}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Environment</dt>
                <dd className="mt-1">{incident.environment}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Reported By</dt>
                <dd className="mt-1">{incident.reportedBy}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Assigned To</dt>
                <dd className="mt-1">{incident.assignedTo ?? 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Resolved At</dt>
                <dd className="mt-1">
                  {incident.resolvedAt
                    ? timestampFormatter.format(new Date(incident.resolvedAt))
                    : 'Not resolved'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[28px] border border-red-200/80 bg-white px-6 py-6 shadow-panel">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
              Source
            </p>
            {incident.sourceAlertId && incident.sourceAlert ? (
              <div className="mt-4 rounded-[24px] border border-red-100 bg-red-50 px-5 py-5">
                <p className="text-sm font-semibold text-red-950">{incident.sourceAlert.title}</p>
                <p className="mt-2 text-sm text-slate-600">{incident.sourceAlert.service}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <IncidentBadge type="severity" value={incident.sourceAlert.severity} />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSourceAlert(incident.sourceAlertId!)}
                  className="mt-4 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-900 transition hover:bg-white"
                >
                  Open Source Alert
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                This incident was created manually and is not linked to an originating alert.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[28px] border border-red-200/80 bg-white px-5 py-5 shadow-panel">
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
              Actions
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-red-950">
              Update incident state
            </h2>

            <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-600">
              Status
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as IncidentStatus)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none transition focus:border-red-400"
              >
                {INCIDENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => void handleSaveStatus(selectedStatus)}
                disabled={isSaving}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving status...' : 'Save Status'}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveStatus('Resolved')}
                disabled={isSaving || incident.status === 'Resolved' || incident.status === 'Closed'}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Updating...' : 'Mark Resolved'}
              </button>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
