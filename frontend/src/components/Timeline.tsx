import type { InvestigationNote } from '../types/alert';
import { EmptyState } from './EmptyState';
import { NoteItem } from './NoteItem';

interface TimelineProps {
  notes: InvestigationNote[];
}

export function Timeline({ notes }: TimelineProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No investigation activity yet"
        description="Once an operator starts documenting checks, actions, or escalations, the alert timeline will appear here in chronological order."
      />
    );
  }

  return (
    <div className="rounded-[28px] border border-line/80 bg-panel px-6 py-6 shadow-panel">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-accentDark/70">
            Investigation Timeline
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-ink">Ops activity log</h2>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          {notes.length} entries
        </p>
      </div>

      <div className="relative space-y-4 before:absolute before:bottom-0 before:left-[0.4rem] before:top-2 before:w-px before:bg-line">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
