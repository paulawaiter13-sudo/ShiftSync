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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] border border-line bg-panel p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
              Alert Intake
            </p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-ink">Log new alert</h3>
            <p className="mt-2 text-sm text-slate-600">
              Capture the raw signal with enough operational context for the on-shift team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-2 text-sm font-semibold text-slate-600"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 md:col-span-2">
              Title
              <input
                required
                value={formValues.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                placeholder="Payment API latency spike detected"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 md:col-span-2">
              Description
              <textarea
                required
                rows={4}
                value={formValues.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                placeholder="Describe the alert signal, threshold breach, and current impact."
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Source
              <input
                required
                value={formValues.source}
                onChange={(event) => handleChange('source', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                placeholder="Datadog"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Service
              <input
                required
                value={formValues.service}
                onChange={(event) => handleChange('service', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                placeholder="Payments API"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Severity
              <select
                value={formValues.severity}
                onChange={(event) => handleChange('severity', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
              >
                {ALERT_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Triggered at
              <input
                required
                type="datetime-local"
                value={formValues.triggeredAt}
                onChange={(event) => handleChange('triggeredAt', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Shift date
              <input
                required
                type="date"
                value={formValues.shiftDate}
                onChange={(event) => handleChange('shiftDate', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Tags
              <input
                value={formValues.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                className="rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
                placeholder="payments, latency, customer-impact"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-line px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Logging alert...' : 'Log Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
