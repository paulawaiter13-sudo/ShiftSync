import { useEffect, useState, type FormEvent } from 'react';
import type { Alert } from '../types/alert';
import type { CreateIncidentFromAlertPayload } from '../types/incident';
import {
  INCIDENT_CATEGORIES,
  INCIDENT_ENVIRONMENTS
} from '../types/incident';
import { ALERT_SEVERITIES } from '../types/alert';

interface DeclareIncidentModalProps {
  open: boolean;
  alert: Alert | null;
  reportedBy: string;
  onClose: () => void;
  onSubmit: (payload: CreateIncidentFromAlertPayload) => Promise<void>;
}

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-red-950/45 px-4 py-8">
      <div className="w-full max-w-3xl rounded-[32px] border border-red-200 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.3em] text-red-700/70">
              Incident Declaration
            </p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-red-950">
              Declare incident from alert
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Confirm that this alert is a validated operational incident and capture the incident
              record with alert context already attached.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-slate-600"
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
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 md:col-span-2">
              Description
              <textarea
                required
                rows={5}
                value={formValues.description}
                onChange={(event) => handleChange('description', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Category
              <select
                value={formValues.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              >
                {INCIDENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Environment
              <select
                value={formValues.environment}
                onChange={(event) => handleChange('environment', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              >
                {INCIDENT_ENVIRONMENTS.map((environment) => (
                  <option key={environment} value={environment}>
                    {environment}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Severity
              <select
                value={formValues.severity}
                onChange={(event) => handleChange('severity', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              >
                {ALERT_SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Affected Service
              <input
                required
                value={formValues.affectedService}
                onChange={(event) => handleChange('affectedService', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Assigned To
              <input
                value={formValues.assignedTo}
                onChange={(event) => handleChange('assignedTo', event.target.value)}
                className="rounded-2xl border border-red-100 bg-white px-4 py-3 outline-none focus:border-red-400"
                placeholder="DevOps On-Call"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
              Reported By
              <input
                value={reportedBy}
                readOnly
                className="rounded-2xl border border-red-100 bg-slate-50 px-4 py-3 text-slate-500"
              />
            </label>

            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800 md:col-span-2">
              Source alert: <span className="font-semibold">{alert.title}</span> from {alert.source}
            </div>
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
              className="rounded-2xl border border-red-100 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Declaring incident...' : 'Declare Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
