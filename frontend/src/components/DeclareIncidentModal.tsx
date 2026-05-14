import { useEffect, useState, type FormEvent } from 'react';
import type { Alert } from '../types/alert';
import { ALERT_SEVERITIES } from '../types/alert';
import type { CreateIncidentFromAlertPayload } from '../types/incident';
import { INCIDENT_CATEGORIES, INCIDENT_ENVIRONMENTS } from '../types/incident';

interface DeclareIncidentModalProps {
  open: boolean;
  alert: Alert | null;
  reportedBy: string;
  onClose: () => void;
  onSubmit: (payload: CreateIncidentFromAlertPayload) => Promise<void>;
}

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition focus:border-sev-critical/45 focus:ring-1 focus:ring-sev-critical/25';

export function DeclareIncidentModal({
  open,
  alert,
  reportedBy,
  onClose,
  onSubmit
}: DeclareIncidentModalProps) {
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    category: 'Application',
    severity: 'High',
    affectedService: '',
    environment: 'Production',
    assignedTo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!alert || !open) {
      return;
    }

    setFormValues({
      title: alert.title,
      description: alert.description,
      category: 'Application',
      severity: alert.severity,
      affectedService: alert.service,
      environment: 'Production',
      assignedTo: ''
    });
    setError(null);
  }, [alert, open]);

  if (!open || !alert) {
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
    setError(null);

    if (!reportedBy.trim()) {
      setError('Set the acting operator name before declaring an incident.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        category: formValues.category as CreateIncidentFromAlertPayload['category'],
        severity: formValues.severity as CreateIncidentFromAlertPayload['severity'],
        affectedService: formValues.affectedService.trim(),
        environment: formValues.environment as CreateIncidentFromAlertPayload['environment'],
        reportedBy: reportedBy.trim(),
        assignedTo: formValues.assignedTo.trim() || null
      });
      onClose();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Unable to declare incident'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-sev-critical/30 bg-ops-panel p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xs font-bold uppercase tracking-widest text-sev-critical">Declare incident</p>
            <h3 className="mt-1 text-xl font-semibold text-ops-foreground">Promote from alert</h3>
            <p className="mt-2 text-sm text-ops-muted">
              Confirmed production issue — incident record will retain alert lineage.
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
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted md:col-span-2">
              Description
              <textarea
                required
                rows={5}
                value={formValues.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Category
              <select
                value={formValues.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className={fieldClass}
              >
                {INCIDENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Environment
              <select
                value={formValues.environment}
                onChange={(event) => handleChange('environment', event.target.value)}
                className={fieldClass}
              >
                {INCIDENT_ENVIRONMENTS.map((environment) => (
                  <option key={environment} value={environment}>
                    {environment}
                  </option>
                ))}
              </select>
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
              Affected service
              <input
                required
                value={formValues.affectedService}
                onChange={(event) => handleChange('affectedService', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Assigned to
              <input
                value={formValues.assignedTo}
                onChange={(event) => handleChange('assignedTo', event.target.value)}
                className={fieldClass}
                placeholder="DevOps on-call"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
              Reported by
              <input
                value={reportedBy}
                readOnly
                className="cursor-not-allowed rounded-lg border border-ops-border bg-ops-elevated/50 px-3 py-2.5 text-sm text-ops-muted"
              />
            </label>

            <div className="rounded-lg border border-ops-border bg-ops-canvas/50 px-3 py-2 text-sm text-ops-muted md:col-span-2">
              Source alert: <span className="font-medium text-ops-foreground">{alert.title}</span> ·{' '}
              {alert.source}
            </div>
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
              className="rounded-lg bg-sev-critical px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Declaring…' : 'Declare incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
