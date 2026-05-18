import type { FollowUpPriority, FollowUpStatus } from '../../types/handover';
import { FOLLOW_UP_PRIORITIES, FOLLOW_UP_STATUSES } from '../../types/handover';
import type { AlertSeverity } from '../../types/alert';
import { SeverityBadge } from '../SeverityBadge';

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-sm text-ops-foreground outline-none transition focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

export interface FollowUpDraft {
  localKey: string;
  id?: string;
  title: string;
  description: string;
  owner: string;
  priority: FollowUpPriority;
  status: FollowUpStatus;
}

interface FollowUpItemEditorProps {
  item: FollowUpDraft;
  showStatus?: boolean;
  onChange: (localKey: string, patch: Partial<Omit<FollowUpDraft, 'localKey'>>) => void;
  onRemove: (localKey: string) => void;
}

export function FollowUpItemEditor({ item, showStatus = false, onChange, onRemove }: FollowUpItemEditorProps) {
  return (
    <div className="rounded-xl border border-ops-border bg-ops-panel/80 p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-2xs font-bold uppercase tracking-wider text-ops-muted">Follow-up</p>
        <button
          type="button"
          onClick={() => onRemove(item.localKey)}
          className="rounded-md border border-ops-border px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ops-muted transition hover:border-sev-critical/40 hover:text-sev-critical"
        >
          Remove
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Title</span>
          <input
            className={fieldClass}
            value={item.title}
            onChange={(e) => onChange(item.localKey, { title: e.target.value })}
            placeholder="Short actionable title"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Description</span>
          <textarea
            className={`${fieldClass} min-h-[4.5rem] resize-y`}
            value={item.description}
            onChange={(e) => onChange(item.localKey, { description: e.target.value })}
            placeholder="Context, acceptance criteria, or links for the next shift"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Owner</span>
          <input
            className={fieldClass}
            value={item.owner}
            onChange={(e) => onChange(item.localKey, { owner: e.target.value })}
            placeholder="Optional owner or queue"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Priority</span>
          <select
            className={fieldClass}
            value={item.priority}
            onChange={(e) => onChange(item.localKey, { priority: e.target.value as FollowUpPriority })}
          >
            {FOLLOW_UP_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        {showStatus ? (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Status</span>
            <select
              className={fieldClass}
              value={item.status}
              onChange={(e) => onChange(item.localKey, { status: e.target.value as FollowUpStatus })}
            >
              {FOLLOW_UP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xs text-ops-muted">Preview:</span>
        <SeverityBadge severity={item.priority as AlertSeverity} size="xs" />
      </div>
    </div>
  );
}
