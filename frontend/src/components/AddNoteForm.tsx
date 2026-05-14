import { useState, type FormEvent } from 'react';
import type { CreateInvestigationNotePayload } from '../types/alert';
import { INVESTIGATION_NOTE_TYPES } from '../types/alert';
import { SectionCard } from './SectionCard';

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition placeholder:text-ops-muted/40 focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25 disabled:cursor-not-allowed disabled:opacity-50';

interface AddNoteFormProps {
  createdBy: string;
  disabled?: boolean;
  submitting?: boolean;
  onSubmit: (payload: CreateInvestigationNotePayload) => Promise<void>;
}

export function AddNoteForm({
  createdBy,
  disabled = false,
  submitting = false,
  onSubmit
}: AddNoteFormProps) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<CreateInvestigationNotePayload['type']>('Note');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!createdBy.trim()) {
      setError('Set the operator name before adding a note.');
      return;
    }

    try {
      await onSubmit({
        message: message.trim(),
        type,
        createdBy: createdBy.trim()
      });
      setMessage('');
      setType('Note');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to add note');
    }
  };

  return (
    <SectionCard eyebrow="Documentation" title="Add note" description="Append to the investigation timeline.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
          Message
          <textarea
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={disabled || submitting}
            className={fieldClass}
            placeholder="Checks performed, vendor comms, mitigation, customer impact…"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-ops-muted">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CreateInvestigationNotePayload['type'])}
            disabled={disabled || submitting}
            className={fieldClass}
          >
            {INVESTIGATION_NOTE_TYPES.map((noteType) => (
              <option key={noteType} value={noteType}>
                {noteType}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <div className="rounded-lg border border-sev-critical/35 bg-sev-critical/10 px-3 py-2 text-sm text-sev-critical">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || submitting}
          className="w-full rounded-lg bg-state-open px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Append note'}
        </button>
      </form>
    </SectionCard>
  );
}
