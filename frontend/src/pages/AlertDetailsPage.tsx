import { useEffect, useState } from 'react';
import { AddNoteForm } from '../components/AddNoteForm';
import { Badge } from '../components/Badge';
import { DeclareIncidentModal } from '../components/DeclareIncidentModal';
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
      <div className="rounded-[28px] border border-line/80 bg-panel px-6 py-8 shadow-panel">
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-6 h-48 animate-pulse rounded-[28px] bg-slate-200" />
        <div className="mt-6 h-72 animate-pulse rounded-[28px] bg-slate-200" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-6 text-sm text-danger shadow-panel">
        {error ?? 'Alert not found'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <section className="rounded-[28px] border border-line/80 bg-panel px-6 py-6 shadow-panel">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-accent hover:text-accentDark"
              >
                Back to Alerts
              </button>
              <p className="mt-5 font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
                Alert Investigation
              </p>
              <h1 className="mt-2 font-heading text-4xl font-semibold text-ink">{alert.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{alert.description}</p>
            </div>

            <div className="rounded-[24px] border border-line bg-white/70 p-5 xl:min-w-[320px]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Triggered
              </p>
              <p className="mt-2 font-heading text-lg text-ink">
                {timestampFormatter.format(new Date(alert.triggeredAt))}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge type="severity" value={alert.severity} />
                <Badge type="status" value={alert.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {alert.source}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr),minmax(360px,0.95fr)]">
          <div className="space-y-4">
            <section className="rounded-[28px] border border-line/80 bg-panel px-6 py-6 shadow-panel">
              <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                <div>
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
                    Alert Summary
                  </p>
                  <dl className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-ink">Service</dt>
                      <dd className="mt-1">{alert.service}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Source</dt>
                      <dd className="mt-1">{alert.source}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Acknowledged by</dt>
                      <dd className="mt-1">{alert.acknowledgedBy ?? 'Unassigned'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Investigation started</dt>
                      <dd className="mt-1">
                        {alert.investigationStartedAt
                          ? timestampFormatter.format(new Date(alert.investigationStartedAt))
                          : 'Not started'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Last updated by</dt>
                      <dd className="mt-1">{alert.lastUpdatedBy ?? 'No activity yet'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Shift date</dt>
                      <dd className="mt-1">
                        {new Date(alert.shiftDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>

                {alert.tags?.length ? (
                  <div className="max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Tags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alert.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-accentDark"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <Timeline notes={notes} />
          </div>

          <div className="space-y-4">
            <section className="rounded-[28px] border border-line/80 bg-panel px-5 py-5 shadow-panel">
              <div>
                <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
                  Quick Actions
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">
                  Drive the workflow
                </h2>
              </div>

              <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-600">
                Acting as
                <input
                  value={operatorName}
                  onChange={(event) => setOperatorName(event.target.value)}
                  className="rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
                  placeholder="Shift operator name"
                />
              </label>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => void handleStatusAction('acknowledge')}
                  disabled={isSavingAction || alert.status !== 'New'}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accentDark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingAction && alert.status === 'New'
                    ? 'Acknowledging...'
                    : 'Acknowledge Alert'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusAction('Investigating')}
                  disabled={isSavingAction || !['Acknowledged', 'Investigating'].includes(alert.status)}
                  className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingAction && alert.status !== 'Closed'
                    ? 'Saving...'
                    : 'Mark as Investigating'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusAction('Closed')}
                  disabled={isSavingAction || alert.status !== 'Investigating'}
                  className="rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingAction && alert.status === 'Investigating'
                    ? 'Closing...'
                    : 'Mark as Closed'}
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-red-200/70 bg-white px-5 py-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
                    Incident Decision
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold text-red-950">
                    Incident linkage
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Promote this alert into a managed incident only after investigation confirms a
                    critical, real issue.
                  </p>
                </div>
              </div>

              {alert.relatedIncidentId ? (
                <div className="mt-5 rounded-[24px] border border-red-100 bg-red-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-red-700/70">
                    Linked Incident
                  </p>
                  <p className="mt-2 font-heading text-xl text-red-950">
                    #{alert.relatedIncidentId.slice(-8)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateToIncident(alert.relatedIncidentId!)}
                    className="mt-4 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Open Linked Incident
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeclareModalOpen(true)}
                  disabled={alert.status === 'Closed'}
                  className="mt-5 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {alert.status === 'Closed' ? 'Cannot Declare from Closed Alert' : 'Declare Incident'}
                </button>
              )}
            </section>

            <AddNoteForm
              createdBy={operatorName}
              disabled={alert.status === 'Closed'}
              submitting={isSubmittingNote}
              onSubmit={handleAddNote}
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}
          </div>
        </section>
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
