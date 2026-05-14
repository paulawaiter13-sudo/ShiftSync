import { useEffect, useState } from 'react';
import { SectionCard } from '../components/SectionCard';
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

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

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
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-xl bg-ops-panel shadow-[inset_0_0_0_1px_rgba(239,68,68,0.15)]" />
        <div className="h-52 animate-pulse rounded-xl bg-ops-panel" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-5 py-5 text-sm text-sev-critical">
        {error ?? 'Incident not found'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sev-critical/25 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),transparent_50%)] p-5 shadow-card md:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-ops-border bg-ops-panel/80 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-ops-muted transition hover:text-ops-foreground"
            >
              ← Incidents
            </button>
            <p className="mt-4 text-2xs font-bold uppercase tracking-widest text-sev-critical">Incident record</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">
              {incident.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ops-muted">{incident.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <IncidentBadge type="severity" value={incident.severity} />
              <IncidentBadge type="status" value={incident.status} />
            </div>
          </div>

          <div className="w-full shrink-0 rounded-lg border border-ops-border bg-ops-panel/90 p-4 xl:w-80">
            <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Declared</p>
            <p className="mt-1 font-mono text-sm font-medium text-ops-foreground">
              {timestampFormatter.format(new Date(incident.createdAt))}
            </p>
            <p className="mt-3 text-2xs text-ops-muted">Environment</p>
            <p className="mt-0.5 text-sm font-semibold text-ops-foreground">{incident.environment}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),360px]">
        <div className="space-y-4">
          <SectionCard eyebrow="Record" title="Metadata" description="Command fields for this incident.">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                  Affected service
                </dt>
                <dd className="mt-1 text-ops-foreground">{incident.affectedService}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Category</dt>
                <dd className="mt-1 text-ops-foreground">{incident.category}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Reported by</dt>
                <dd className="mt-1 text-ops-foreground">{incident.reportedBy}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Assigned to</dt>
                <dd className="mt-1 text-ops-foreground">{incident.assignedTo ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Resolved at</dt>
                <dd className="mt-1 text-ops-foreground">
                  {incident.resolvedAt
                    ? timestampFormatter.format(new Date(incident.resolvedAt))
                    : '—'}
                </dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard eyebrow="Lineage" title="Source" description="Originating alert when promoted from intake.">
            {incident.sourceAlertId && incident.sourceAlert ? (
              <div className="rounded-lg border border-ops-border bg-ops-canvas/40 p-4">
                <p className="font-medium text-ops-foreground">{incident.sourceAlert.title}</p>
                <p className="mt-1 text-sm text-ops-muted">{incident.sourceAlert.service}</p>
                <div className="mt-3">
                  <IncidentBadge type="severity" value={incident.sourceAlert.severity} />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSourceAlert(incident.sourceAlertId!)}
                  className="mt-4 rounded-lg border border-ops-border bg-ops-panel px-4 py-2 text-sm font-semibold text-ops-foreground transition hover:border-state-open/40"
                >
                  Open source alert
                </button>
              </div>
            ) : (
              <p className="text-sm text-ops-muted">
                This incident was created manually and is not linked to an originating alert.
              </p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            className="border-sev-critical/25 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]"
            eyebrow="Command"
            title="Status"
            description="Update lifecycle state for stakeholders and paging."
          >
            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Next status
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as IncidentStatus)}
                className={fieldClass}
              >
                {INCIDENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => void handleSaveStatus(selectedStatus)}
                disabled={isSaving}
                className="rounded-lg bg-sev-critical px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save status'}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveStatus('Resolved')}
                disabled={isSaving || incident.status === 'Resolved' || incident.status === 'Closed'}
                className="rounded-lg border border-sev-low/35 bg-sev-low/15 px-4 py-2.5 text-sm font-semibold text-sev-low transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mark resolved
              </button>
            </div>
          </SectionCard>

          {error ? (
            <div className="rounded-lg border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
