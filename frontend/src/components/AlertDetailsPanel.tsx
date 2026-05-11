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
    <div className="fixed inset-y-0 right-0 z-30 flex w-full max-w-xl border-l border-line bg-panel shadow-panel">
      <div className="flex w-full flex-col overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
              Alert Detail
            </p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">
              {isLoading ? 'Loading alert...' : alert?.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-2 text-sm font-semibold text-slate-600"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="mt-6 h-40 animate-pulse rounded-3xl bg-slate-200" />
        ) : alert ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-[28px] border border-line bg-white/70 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge type="severity" value={alert.severity} />
                <Badge type="status" value={alert.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {alert.source}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">{alert.description}</p>

              <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-ink">Service</dt>
                  <dd className="mt-1">{alert.service}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">Triggered at</dt>
                  <dd className="mt-1">{timestampFormatter.format(new Date(alert.triggeredAt))}</dd>
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
                <div>
                  <dt className="font-semibold text-ink">Acknowledged by</dt>
                  <dd className="mt-1">{alert.acknowledgedBy ?? 'Unassigned'}</dd>
                </div>
              </dl>

              {alert.tags?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {alert.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-accentDark"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-line bg-white/70 p-5">
              <h4 className="font-heading text-lg font-semibold text-ink">Update status</h4>
              <div className="mt-4 space-y-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Status
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as AlertStatus)}
                    className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                  >
                    {ALERT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Acknowledged by
                  <input
                    value={acknowledgedBy}
                    onChange={(event) => setAcknowledgedBy(event.target.value)}
                    className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                    placeholder="Shift Operator"
                  />
                </label>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="mt-5 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving changes...' : 'Save Status'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger">
            {error ?? 'Alert not found'}
          </div>
        )}
      </div>
    </div>
  );
}
