import { useEffect, useState } from 'react';
import { fetchAlertById, updateAlertStatus } from '../services/alerts';
import type { Alert, AlertStatus } from '../types/alert';
import { ALERT_STATUSES } from '../types/alert';
import { Badge } from './Badge';

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

interface AlertDetailsPanelProps {
  alertId: string | null;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export function AlertDetailsPanel({ alertId, onClose, onUpdated }: AlertDetailsPanelProps) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>('New');
  const [acknowledgedBy, setAcknowledgedBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alertId) {
      setAlert(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchAlertById(alertId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setAlert(response.data);
        setSelectedStatus(response.data.status);
        setAcknowledgedBy(response.data.acknowledgedBy ?? '');
      })
      .catch((fetchError) => {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to load alert');
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

  if (!alertId) {
    return null;
  }

  const handleSave = async () => {
    if (!alert) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateAlertStatus(alert.id, {
        status: selectedStatus,
        acknowledgedBy: acknowledgedBy.trim() || undefined
      });
      setAlert(response.data);
      setSelectedStatus(response.data.status);
      setAcknowledgedBy(response.data.acknowledgedBy ?? '');
      await onUpdated();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update alert');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl border-l border-ops-border bg-ops-panel shadow-card">
      <div className="flex w-full flex-col overflow-y-auto p-6 scrollbar-thin">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Alert</p>
            <h3 className="mt-1 text-lg font-semibold text-ops-foreground">
              {isLoading ? 'Loading…' : alert?.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ops-border px-3 py-1.5 text-sm font-medium text-ops-muted transition hover:text-ops-foreground"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-ops-elevated/60" />
        ) : alert ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-ops-border bg-ops-canvas/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge type="severity" value={alert.severity} />
                <Badge type="status" value={alert.status} />
                <span className="rounded-md border border-ops-border bg-ops-elevated px-2 py-1 text-2xs font-medium text-ops-muted">
                  {alert.source}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ops-muted">{alert.description}</p>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Service</dt>
                  <dd className="mt-1 text-ops-foreground">{alert.service}</dd>
                </div>
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Triggered</dt>
                  <dd className="mt-1 text-ops-foreground">
                    {timestampFormatter.format(new Date(alert.triggeredAt))}
                  </dd>
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
                <div>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">
                    Acknowledged by
                  </dt>
                  <dd className="mt-1 text-ops-foreground">{alert.acknowledgedBy ?? '—'}</dd>
                </div>
              </dl>

              {alert.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {alert.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-ops-border bg-ops-elevated px-2 py-1 text-2xs text-ops-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-ops-border bg-ops-canvas/40 p-4">
              <h4 className="text-sm font-semibold text-ops-foreground">Update status</h4>
              <div className="mt-4 space-y-4">
                <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
                  Status
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as AlertStatus)}
                    className={fieldClass}
                  >
                    {ALERT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
                  Acknowledged by
                  <input
                    value={acknowledgedBy}
                    onChange={(event) => setAcknowledgedBy(event.target.value)}
                    className={fieldClass}
                    placeholder="Shift operator"
                  />
                </label>
              </div>

              {error ? (
                <div className="mt-4 rounded-lg border border-sev-critical/35 bg-sev-critical/10 px-3 py-2 text-sm text-sev-critical">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="mt-4 w-full rounded-lg bg-state-open px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save status'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
            {error ?? 'Alert not found'}
          </div>
        )}
      </div>
    </div>
  );
}
