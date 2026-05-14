import type { InvestigationNote, InvestigationNoteType } from '../types/alert';

const typePill: Record<InvestigationNoteType, string> = {
  Note: 'border-ops-border bg-ops-elevated text-ops-muted',
  Action: 'border-state-investigating/35 bg-state-investigating/10 text-state-investigating',
  Escalation: 'border-sev-critical/45 bg-sev-critical/15 text-sev-critical',
  Update: 'border-state-open/35 bg-state-open/10 text-state-open'
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
    <div className="relative flex gap-4 pl-1 md:gap-5">
      <div className="relative z-10 flex shrink-0 flex-col items-center pt-1">
        <span
          className={`h-3 w-3 rounded-full border-2 shadow-sm ${
            isEscalation
              ? 'border-sev-critical/60 bg-sev-critical shadow-[0_0_12px_rgba(239,68,68,0.45)]'
              : 'border-ops-border bg-ops-panel'
          }`}
        />
      </div>

      <article
        className={`min-w-0 flex-1 rounded-lg border px-4 py-3 transition ${
          isEscalation
            ? 'border-sev-critical/40 bg-sev-critical/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12)]'
            : 'border-ops-border bg-ops-canvas/50 hover:border-ops-muted/30'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide ${typePill[note.type]}`}
          >
            {note.type}
          </span>
          <span className="text-2xs font-medium uppercase tracking-wide text-ops-muted">{note.createdBy}</span>
          <span className="font-mono text-2xs text-ops-muted">
            {timestampFormatter.format(new Date(note.createdAt))}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-ops-foreground/95">{note.message}</p>
      </article>
    </div>
  );
}
