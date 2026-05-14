import type { InvestigationNote } from '../types/alert';
import { SectionCard } from './SectionCard';
import { NoteItem } from './NoteItem';

interface TimelineProps {
  notes: InvestigationNote[];
}

export function Timeline({ notes }: TimelineProps) {
  if (notes.length === 0) {
    return (
      <SectionCard
        eyebrow="Investigation"
        title="Timeline"
        description="Chronological operations log for this alert. Entries appear as operators document checks, actions, and escalations."
        padding="md"
      >
        <div className="rounded-lg border border-dashed border-ops-border bg-ops-canvas/40 px-4 py-10 text-center">
          <p className="text-sm font-medium text-ops-foreground">No investigation activity yet</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ops-muted">
            Add notes from the panel on the right. Escalations are highlighted automatically in the stream.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      eyebrow="Investigation"
      title="Timeline"
      description="Operations log — newest context at the bottom of the thread."
      padding="none"
      action={
        <span className="rounded-md border border-ops-border bg-ops-elevated px-2.5 py-1 font-mono text-2xs font-semibold text-ops-muted">
          {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
        </span>
      }
    >
      <div className="relative space-y-0 px-5 py-5 md:px-6">
        <div
          className="pointer-events-none absolute bottom-6 left-[1.35rem] top-8 w-px bg-ops-border md:left-[1.45rem]"
          aria-hidden
        />
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
