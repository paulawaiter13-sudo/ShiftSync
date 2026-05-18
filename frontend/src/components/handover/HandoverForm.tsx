import type { ShiftType } from '../../types/handover';
import { SHIFT_TYPES } from '../../types/handover';

const fieldClass =
  'w-full rounded-lg border border-ops-border bg-ops-canvas px-3 py-2.5 text-sm text-ops-foreground outline-none transition focus:border-state-open/45 focus:ring-1 focus:ring-state-open/25';

interface HandoverFormProps {
  shiftDate: string;
  shiftType: ShiftType;
  createdBy: string;
  summary: string;
  nextShiftNotes: string;
  onChange: (patch: {
    shiftDate?: string;
    shiftType?: ShiftType;
    createdBy?: string;
    summary?: string;
    nextShiftNotes?: string;
  }) => void;
  lockShiftMetadata?: boolean;
}

export function HandoverForm({
  shiftDate,
  shiftType,
  createdBy,
  summary,
  nextShiftNotes,
  onChange,
  lockShiftMetadata = false
}: HandoverFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Shift date</span>
        <input
          type="date"
          className={`${fieldClass} font-mono tabular-nums`}
          value={shiftDate}
          disabled={lockShiftMetadata}
          onChange={(e) => onChange({ shiftDate: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Shift type</span>
        <select
          className={fieldClass}
          value={shiftType}
          disabled={lockShiftMetadata}
          onChange={(e) => onChange({ shiftType: e.target.value as ShiftType })}
        >
          {SHIFT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">Created by</span>
        <input
          className={fieldClass}
          value={createdBy}
          disabled={lockShiftMetadata}
          onChange={(e) => onChange({ createdBy: e.target.value })}
          placeholder="Operator name or desk ID"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">
          Shift summary
        </span>
        <textarea
          className={`${fieldClass} min-h-[6rem] resize-y`}
          value={summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Operational picture: what changed, what is stable, and what needs eyes next."
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-1 block text-2xs font-semibold uppercase tracking-wide text-ops-muted">
          Notes for next shift
        </span>
        <textarea
          className={`${fieldClass} min-h-[5rem] resize-y`}
          value={nextShiftNotes}
          onChange={(e) => onChange({ nextShiftNotes: e.target.value })}
          placeholder="Handoffs, caveats, vendor comms, or customer messaging the next operator should know."
        />
      </label>
    </div>
  );
}
