import { useState, type FormEvent } from 'react';
import type { CreateAlertPayload } from '../types/alert';
import { ALERT_SEVERITIES } from '../types/alert';

interface NewAlertModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAlertPayload) => Promise<void>;
}

const currentTimestamp = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

const currentShiftDate = () => new Date().toISOString().slice(0, 10);

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition placeholder:text-ops-muted/40 focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

export function NewAlertModal({ open, onClose, onSubmit }: NewAlertModalProps) {
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    source: '',
    service: '',
    severity: 'Medium',
    triggeredAt: currentTimestamp(),
    shiftDate: currentShiftDate(),
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        source: formValues.source.trim(),
        service: formValues.service.trim(),
        severity: formValues.severity as CreateAlertPayload['severity'],
        triggeredAt: new Date(formValues.triggeredAt).toISOString(),
        shiftDate: new Date(`${formValues.shiftDate}T00:00:00`).toISOString(),
        tags: formValues.tags
          ? formValues.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : undefined
      });

      setFormValues({
        title: '',
        description: '',
        source: '',
        service: '',
        severity: 'Medium',
        triggeredAt: currentTimestamp(),
        shiftDate: currentShiftDate(),
        tags: ''
      });
      onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to log alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-ops-border bg-ops-panel p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-ops-muted">Intake</p>
            <h3 className="mt-1 text-xl font-semibold text-ops-foreground">Log new alert</h3>
            <p className="mt-2 text-sm text-ops-muted">
              Capture the raw signal with enough context for the active shift.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ops-border px-3 py-1.5 text-sm font-medium text-ops-muted transition hover:text-ops-foreground"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted md:col-span-2">
              Title
              <input
                required
                value={formValues.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className={fieldClass}
                placeholder="Payment API latency spike"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted md:col-span-2">
              Description
              <textarea
                required
                rows={4}
                value={formValues.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className={fieldClass}
                placeholder="Threshold breach, scope, and current impact."
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Source
              <input
                required
                value={formValues.source}
                onChange={(event) => handleChange('source', event.target.value)}
                className={fieldClass}
                placeholder="Datadog"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Service
              <input
                required
                value={formValues.service}
                onChange={(event) => handleChange('service', event.target.value)}
                className={fieldClass}
                placeholder="Payments API"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Severity
              <select
                value={formValues.severity}
                onChange={(event) => handleChange('severity', event.target.value)}
                className={fieldClass}
              >
                {ALERT_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Triggered at
              <input
                required
                type="datetime-local"
                value={formValues.triggeredAt}
                onChange={(event) => handleChange('triggeredAt', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Shift date
              <input
                required
                type="date"
                value={formValues.shiftDate}
                onChange={(event) => handleChange('shiftDate', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted md:col-span-2">
              Tags
              <input
                value={formValues.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className={fieldClass}
                placeholder="payments, latency, customer-impact"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-lg border border-sev-critical/35 bg-sev-critical/10 px-3 py-2 text-sm text-sev-critical">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-ops-border px-4 py-2.5 text-sm font-semibold text-ops-muted transition hover:text-ops-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-state-open px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Logging…' : 'Log alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
