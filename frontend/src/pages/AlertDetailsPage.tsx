import { useEffect, useState } from 'react';
import { AddNoteForm } from '../components/AddNoteForm';
import { DeclareIncidentModal } from '../components/DeclareIncidentModal';
import { SectionCard } from '../components/SectionCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Timeline } from '../components/Timeline';
import {
  acknowledgeAlert,
  createAlertNote,
  fetchAlertById,
  fetchAlertNotes,
  updateAlertStatus
} from '../services/alerts';
import { createIncidentFromAlert } from '../services/incidents';
import type { Alert, AlertStatus, InvestigationNote } from '../types/alert';
import type { CreateIncidentFromAlertPayload } from '../types/incident';

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const inputClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition placeholder:text-ops-muted/40 focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

interface AlertDetailsPageProps {
  alertId: string;
  onBack: () => void;
  onNavigateToIncident: (incidentId: string) => void;
}

export function AlertDetailsPage({
  alertId,
  onBack,
  onNavigateToIncident
}: AlertDetailsPageProps) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState<InvestigationNote[]>([]);
  const [operatorName, setOperatorName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchAlertById(alertId), fetchAlertNotes(alertId)])
      .then(([alertResponse, notesResponse]) => {
        if (!isMounted) {
          return;
        }

        setAlert(alertResponse.data);
        setNotes(notesResponse.data);
        setOperatorName(
          alertResponse.data.acknowledgedBy ?? alertResponse.data.lastUpdatedBy ?? ''
        );
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load alert');
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
  }, [alertId]);

  const handleStatusAction = async (nextStatus: AlertStatus | 'acknowledge') => {
    if (!alert) {
      return;
    }

    if (!operatorName.trim()) {
      setError('Set the operator name before updating the investigation workflow.');
      return;
    }

    setIsSavingAction(true);
    setError(null);

    try {
      const response =
        nextStatus === 'acknowledge'
          ? await acknowledgeAlert(alert.id, { acknowledgedBy: operatorName.trim() })
          : await updateAlertStatus(alert.id, {
              status: nextStatus,
              updatedBy: operatorName.trim()
            });

      setAlert(response.data);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to update alert');
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleAddNote = async (payload: {
    message: string;
    type: 'Note' | 'Action' | 'Escalation' | 'Update';
    createdBy: string;
  }) => {
    if (!alert) {
      return;
    }

    setIsSubmittingNote(true);
    setError(null);

    try {
      const response = await createAlertNote(alert.id, payload);
      setNotes((current) =>
        [...current, response.data].sort(
          (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        )
      );

      if (response.alert) {
        setAlert(response.alert);
      } else {
        const refreshedAlert = await fetchAlertById(alert.id);
        setAlert(refreshedAlert.data);
      }
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : 'Unable to add note');
      throw noteError;
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeclareIncident = async (payload: CreateIncidentFromAlertPayload) => {
    if (!alert) {
      return;
    }

    setError(null);

    try {
      const response = await createIncidentFromAlert(alert.id, payload);
      setAlert((current) =>
        current
          ? {
              ...current,
              relatedIncidentId: response.alert.relatedIncidentId,
              status: response.alert.status as AlertStatus,
              acknowledgedBy: response.alert.acknowledgedBy,
              investigationStartedAt: response.alert.investigationStartedAt,
              lastUpdatedBy: response.alert.lastUpdatedBy
            }
          : current
      );
      onNavigateToIncident(response.data.id);
    } catch (incidentError) {
      setError(
        incidentError instanceof Error ? incidentError.message : 'Unable to declare incident'
      );
      throw incidentError;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-xl bg-ops-panel" />
        <div className="h-40 animate-pulse rounded-xl bg-ops-panel" />
        <div className="grid gap-4 xl:grid-cols-[1fr,380px]">
          <div className="h-96 animate-pulse rounded-xl bg-ops-panel" />
          <div className="h-72 animate-pulse rounded-xl bg-ops-panel" />
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-5 py-5 text-sm text-sev-critical">
        {error ?? 'Alert not found'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <SectionCard padding="md">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-ops-border px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-ops-muted transition hover:border-ops-muted/50 hover:text-ops-foreground"
              >
                ← Alerts
              </button>
              <p className="mt-4 text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                Alert workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">
                {alert.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ops-muted">{alert.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={alert.severity} />
                <StatusBadge domain="alert" status={alert.status} />
                <span className="rounded-md border border-ops-border bg-ops-elevated px-2.5 py-1 text-2xs font-medium text-ops-muted">
                  {alert.source}
                </span>
              </div>
            </div>

            <div className="w-full shrink-0 rounded-lg border border-ops-border bg-ops-canvas/40 p-4 xl:w-80">
              <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Triggered</p>
              <p className="mt-1 font-mono text-sm font-medium text-ops-foreground">
                {timestampFormatter.format(new Date(alert.triggeredAt))}
              </p>
              <p className="mt-3 text-2xs font-semibold uppercase tracking-wider text-ops-muted">Service</p>
              <p className="mt-1 text-sm text-ops-foreground">{alert.service}</p>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),380px]">
          <div className="space-y-4">
            <SectionCard
              eyebrow="Summary"
              title="Signal context"
              description="Immutable intake fields plus investigation ownership."
            >
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Service</dt>
                  <dd className="mt-1 text-ops-foreground">{alert.service}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Source</dt>
                  <dd className="mt-1 text-ops-foreground">{alert.source}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                    Acknowledged by
                  </dt>
                  <dd className="mt-1 text-ops-foreground">{alert.acknowledgedBy ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                    Investigation started
                  </dt>
                  <dd className="mt-1 text-ops-foreground">
                    {alert.investigationStartedAt
                      ? timestampFormatter.format(new Date(alert.investigationStartedAt))
                      : 'Not started'}
                  </dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                    Last updated by
                  </dt>
                  <dd className="mt-1 text-ops-foreground">{alert.lastUpdatedBy ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Shift date</dt>
                  <dd className="mt-1 text-ops-foreground">
                    {new Date(alert.shiftDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>

              {alert.tags?.length ? (
                <div className="mt-6 border-t border-ops-border pt-5">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-ops-border bg-ops-elevated px-2 py-1 text-2xs font-medium text-ops-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <Timeline notes={notes} />
          </div>

          <div className="space-y-4">
            <SectionCard eyebrow="Actions" title="Workflow" description="Operator-gated state transitions.">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
                Acting as
                <input
                  value={operatorName}
                  onChange={(event) => setOperatorName(event.target.value)}
                  className={inputClass}
                  placeholder="Operator name"
                />
              </label>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => void handleStatusAction('acknowledge')}
                  disabled={isSavingAction || alert.status !== 'New'}
                  className="rounded-lg border border-ops-border bg-ops-canvas px-4 py-2.5 text-sm font-semibold text-ops-foreground transition hover:border-ops-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSavingAction && alert.status === 'New' ? 'Acknowledging…' : 'Acknowledge'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusAction('Investigating')}
                  disabled={isSavingAction || !['Acknowledged', 'Investigating'].includes(alert.status)}
                  className="rounded-lg border border-state-investigating/40 bg-state-investigating/15 px-4 py-2.5 text-sm font-semibold text-state-investigating transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark investigating
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusAction('Closed')}
                  disabled={isSavingAction || alert.status !== 'Investigating'}
                  className="rounded-lg border border-sev-low/35 bg-sev-low/15 px-4 py-2.5 text-sm font-semibold text-sev-low transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark closed
                </button>
              </div>
            </SectionCard>

            <SectionCard
              className="border-sev-critical/30 shadow-[0_0_0_1px_rgba(239,68,68,0.12)]"
              eyebrow="Incident"
              title="Promotion"
              description="Only after validated customer impact. Creates a linked incident record."
            >
              {alert.relatedIncidentId ? (
                <div className="rounded-lg border border-ops-border bg-ops-canvas/50 p-4">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Linked</p>
                  <p className="mt-1 font-mono text-lg font-semibold text-ops-foreground">
                    #{alert.relatedIncidentId.slice(-8)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateToIncident(alert.relatedIncidentId!)}
                    className="mt-3 w-full rounded-lg bg-sev-critical px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Open incident
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeclareModalOpen(true)}
                  disabled={alert.status === 'Closed'}
                  className="w-full rounded-lg bg-sev-critical px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {alert.status === 'Closed' ? 'Closed — cannot declare' : 'Declare incident'}
                </button>
              )}
            </SectionCard>

            <AddNoteForm
              createdBy={operatorName}
              disabled={alert.status === 'Closed'}
              submitting={isSubmittingNote}
              onSubmit={handleAddNote}
            />

            {error ? (
              <div className="rounded-lg border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <DeclareIncidentModal
        open={isDeclareModalOpen}
        alert={alert}
        reportedBy={operatorName}
        onClose={() => setIsDeclareModalOpen(false)}
        onSubmit={handleDeclareIncident}
      />
    </>
  );
}
