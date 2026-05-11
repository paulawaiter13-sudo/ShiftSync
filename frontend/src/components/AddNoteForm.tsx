import { useState, type FormEvent } from 'react';
import type { CreateInvestigationNotePayload } from '../types/alert';
import { INVESTIGATION_NOTE_TYPES } from '../types/alert';

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
    <section className="rounded-[28px] border border-line/80 bg-panel px-5 py-5 shadow-panel">
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
          Add Investigation Note
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">Document activity</h2>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Message
          <textarea
            required
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={disabled || submitting}
            className="rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Checked logs, reached out to DevOps, restarted worker pool, monitoring metrics..."
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CreateInvestigationNotePayload['type'])}
            disabled={disabled || submitting}
            className="rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {INVESTIGATION_NOTE_TYPES.map((noteType) => (
              <option key={noteType} value={noteType}>
                {noteType}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || submitting}
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Adding note...' : 'Add Note'}
        </button>
      </form>
    </section>
  );
}
