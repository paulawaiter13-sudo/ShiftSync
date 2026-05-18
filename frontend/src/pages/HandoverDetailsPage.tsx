import { useEffect, useState } from 'react';
import { HandoverSummaryCard } from '../components/handover/HandoverSummaryCard';
import { SectionCard } from '../components/SectionCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { IncidentBadge } from '../components/IncidentBadge';
import { fetchHandoverById, updateHandoverStatus } from '../services/handoverService';
import type { AlertSeverity } from '../types/alert';
import type { HandoverDetail, HandoverFollowUpItem } from '../types/handover';

interface HandoverDetailsPageProps {
  handoverId: string;
  onBack: () => void;
  onEdit: (handoverId: string) => void;
}

export function HandoverDetailsPage({ handoverId, onBack, onEdit }: HandoverDetailsPageProps) {
  const [handover, setHandover] = useState<HandoverDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchHandoverById(handoverId)
      .then((res) => {
        if (!cancelled) {
          setHandover(res.data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unable to load handover');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [handoverId]);

  const refresh = () =>
    fetchHandoverById(handoverId).then((res) => {
      setHandover(res.data);
    });

  const runStatus = async (status: 'Ready' | 'Completed') => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await updateHandoverStatus(handoverId, { status });
      setHandover(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update status');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-ops-panel" />
        <div className="h-48 animate-pulse rounded-xl bg-ops-panel" />
      </div>
    );
  }

  if (!handover) {
    return (
      <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-5 py-5 text-sm text-sev-critical">
        {error ?? 'Handover not found'}
      </div>
    );
  }

  const canEdit = handover.status === 'Draft' || handover.status === 'Ready';
  const canMarkReady = handover.status === 'Draft' && handover.summary.trim().length > 0;
  const canMarkCompleted = handover.status === 'Ready';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-ops-border bg-ops-panel/80 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-ops-muted transition hover:text-ops-foreground"
        >
          ← Handovers
        </button>
      </div>

      <HandoverSummaryCard handover={handover} />

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <button
            type="button"
            onClick={() => onEdit(handover.id)}
            className="rounded-lg border border-state-open/40 bg-state-open/15 px-4 py-2 text-sm font-semibold text-state-open transition hover:bg-state-open/25"
          >
            Edit handover
          </button>
        ) : null}
        {handover.status === 'Draft' ? (
          <button
            type="button"
            disabled={!canMarkReady || isSaving}
            onClick={() => void runStatus('Ready')}
            className="rounded-lg border border-ops-border bg-ops-panel px-4 py-2 text-sm font-semibold text-ops-foreground transition hover:border-state-open/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark Ready
          </button>
        ) : null}
        {canMarkCompleted ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void runStatus('Completed')}
            className="rounded-lg border border-sev-low/40 bg-sev-low/10 px-4 py-2 text-sm font-semibold text-sev-low transition hover:bg-sev-low/20 disabled:opacity-50"
          >
            Mark Completed
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-ops-border bg-ops-canvas px-4 py-2 text-sm font-semibold text-ops-muted transition hover:text-ops-foreground"
        >
          Refresh
        </button>
      </div>

      <SectionCard title="Selected alerts" description="Alerts explicitly carried into this handover record.">
        {handover.alerts.length === 0 ? (
          <p className="text-sm text-ops-muted">No alerts linked.</p>
        ) : (
          <ul className="space-y-3">
            {handover.alerts.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-ops-border bg-ops-canvas/40 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ops-foreground">{a.title}</p>
                  <SeverityBadge severity={a.severity} size="xs" />
                  <StatusBadge domain="alert" status={a.status} size="xs" />
                </div>
                <p className="mt-1 text-xs text-ops-muted">{a.service}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Selected incidents" description="Confirmed incidents included for continuity.">
        {handover.incidents.length === 0 ? (
          <p className="text-sm text-ops-muted">No incidents linked.</p>
        ) : (
          <ul className="space-y-3">
            {handover.incidents.map((i) => (
              <li
                key={i.id}
                className="rounded-lg border border-sev-critical/20 bg-ops-canvas/40 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ops-foreground">{i.title}</p>
                  <IncidentBadge type="severity" value={i.severity} compact />
                  <StatusBadge domain="incident" status={i.status} size="xs" />
                </div>
                <p className="mt-1 text-xs text-ops-muted">{i.affectedService}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Follow-up items" description="Tracked commitments and their priority.">
        {handover.followUpItems.length === 0 ? (
          <p className="text-sm text-ops-muted">No follow-up items.</p>
        ) : (
          <ul className="space-y-3">
            {handover.followUpItems.map((f: HandoverFollowUpItem) => (
              <li
                key={f.id}
                className={`rounded-lg border px-3 py-2.5 ${
                  f.status === 'Open' || f.status === 'InProgress'
                    ? 'border-state-open/25 bg-state-open/5'
                    : 'border-ops-border bg-ops-canvas/30'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ops-foreground">{f.title}</p>
                  <SeverityBadge severity={f.priority as AlertSeverity} size="xs" />
                  <span className="rounded-full border border-ops-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ops-muted">
                    {f.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ops-muted">{f.description}</p>
                {f.owner ? (
                  <p className="mt-1 text-2xs uppercase tracking-wide text-ops-muted">Owner: {f.owner}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Notes for next shift" description="Free-form guidance that does not belong in the summary line items.">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ops-foreground">
          {handover.nextShiftNotes?.trim() ? handover.nextShiftNotes : '—'}
        </p>
      </SectionCard>
    </div>
  );
}
