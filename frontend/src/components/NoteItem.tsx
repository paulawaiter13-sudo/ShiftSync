import type { InvestigationNote, InvestigationNoteType } from '../types/alert';

const typeStyles: Record<InvestigationNoteType, string> = {
  Note: 'border-slate-200 bg-white text-slate-700',
  Action: 'border-orange-200 bg-orange-50 text-accentDark',
  Escalation: 'border-red-200 bg-red-50 text-danger',
  Update: 'border-sky-200 bg-sky-50 text-sky-700'
};

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

interface NoteItemProps {
  note: InvestigationNote;
}

export function NoteItem({ note }: NoteItemProps) {
  const isEscalation = note.type === 'Escalation';

  return (
    <div className="relative pl-8">
      <span
        className={`absolute left-0 top-2.5 h-3.5 w-3.5 rounded-full border-4 ${
          isEscalation ? 'border-red-200 bg-danger' : 'border-orange-100 bg-accent'
        }`}
      />
      <article
        className={`rounded-[24px] border px-5 py-4 shadow-sm ${
          isEscalation ? 'border-red-200 bg-red-50/80' : 'border-line bg-white/80'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
              typeStyles[note.type]
            }`}
          >
            {note.type}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {note.createdBy}
          </span>
          <span className="text-xs text-slate-500">
            {timestampFormatter.format(new Date(note.createdAt))}
          </span>
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-700">{note.message}</p>
      </article>
    </div>
  );
}
