import { useCallback, useEffect, useMemo, useState } from 'react';
import { FollowUpItemEditor, type FollowUpDraft } from '../components/handover/FollowUpItemEditor';
import { HandoverForm } from '../components/handover/HandoverForm';
import { SuggestedAlertsSelector } from '../components/handover/SuggestedAlertsSelector';
import { SuggestedIncidentsSelector } from '../components/handover/SuggestedIncidentsSelector';
import {
  createHandover,
  fetchHandoverById,
  fetchHandoverSuggestions,
  updateHandover,
  updateHandoverStatus
} from '../services/handoverService';
import type { ShiftType } from '../types/handover';
import type { HandoverSuggestions } from '../types/handover';

function newLocalKey() {
  return `local-${crypto.randomUUID()}`;
}

function todayDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface CreateHandoverPageProps {
  mode: 'create' | 'edit';
  handoverId?: string;
  onCancel: () => void;
  onSaved: (handoverId: string) => void;
}

export function CreateHandoverPage({ mode, handoverId, onCancel, onSaved }: CreateHandoverPageProps) {
  const [shiftDate, setShiftDate] = useState(todayDateInput());
  const [shiftType, setShiftType] = useState<ShiftType>('Morning');
  const [createdBy, setCreatedBy] = useState('');
  const [summary, setSummary] = useState('');
  const [nextShiftNotes, setNextShiftNotes] = useState('');
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(() => new Set());
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(() => new Set());
  const [followUps, setFollowUps] = useState<FollowUpDraft[]>([]);
  const [suggestions, setSuggestions] = useState<HandoverSuggestions | null>(null);
  const [persistedId, setPersistedId] = useState<string | null>(mode === 'edit' ? handoverId ?? null : null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeField = useCallback(
    (patch: {
      shiftDate?: string;
      shiftType?: ShiftType;
      createdBy?: string;
      summary?: string;
      nextShiftNotes?: string;
    }) => {
      if (patch.shiftDate !== undefined) {
        setShiftDate(patch.shiftDate);
      }
      if (patch.shiftType !== undefined) {
        setShiftType(patch.shiftType);
      }
      if (patch.createdBy !== undefined) {
        setCreatedBy(patch.createdBy);
      }
      if (patch.summary !== undefined) {
        setSummary(patch.summary);
      }
      if (patch.nextShiftNotes !== undefined) {
        setNextShiftNotes(patch.nextShiftNotes);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const loadSuggestions = fetchHandoverSuggestions()
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions({ alerts: [], incidents: [], openFollowUps: [] });
        }
      });

    const loadEdit =
      mode === 'edit' && handoverId
        ? fetchHandoverById(handoverId).then((res) => {
            if (cancelled) {
              return;
            }
            const h = res.data;
            setPersistedId(h.id);
            setShiftDate(h.shiftDate);
            setShiftType(h.shiftType);
            setCreatedBy(h.createdBy);
            setSummary(h.summary);
            setNextShiftNotes(h.nextShiftNotes);
            setSelectedAlertIds(new Set(h.alerts.map((a) => a.id)));
            setSelectedIncidentIds(new Set(h.incidents.map((i) => i.id)));
            setFollowUps(
              h.followUpItems.map((f) => ({
                localKey: f.id,
                id: f.id,
                title: f.title,
                description: f.description,
                owner: f.owner ?? '',
                priority: f.priority,
                status: f.status
              }))
            );
          })
        : Promise.resolve();

    if (mode === 'edit' && handoverId) {
      setIsLoading(true);
      Promise.all([loadSuggestions, loadEdit])
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
    } else {
      setIsLoading(true);
      loadSuggestions
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'Unable to load suggestions');
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [mode, handoverId]);

  const toggleAlert = useCallback((id: string, selected: boolean) => {
    setSelectedAlertIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleIncident = useCallback((id: string, selected: boolean) => {
    setSelectedIncidentIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const addFollowUp = () => {
    setFollowUps((prev) => [
      ...prev,
      {
        localKey: newLocalKey(),
        title: '',
        description: '',
        owner: '',
        priority: 'Medium',
        status: 'Open'
      }
    ]);
  };

  const patchFollowUp = (localKey: string, patch: Partial<Omit<FollowUpDraft, 'localKey'>>) => {
    setFollowUps((prev) =>
      prev.map((item) => (item.localKey === localKey ? { ...item, ...patch } : item))
    );
  };

  const removeFollowUp = (localKey: string) => {
    setFollowUps((prev) => prev.filter((item) => item.localKey !== localKey));
  };

  const buildFollowUpPayload = () =>
    followUps
      .filter((f) => f.title.trim() && f.description.trim())
      .map((f) => ({
        id: f.id,
        title: f.title.trim(),
        description: f.description.trim(),
        owner: f.owner.trim() ? f.owner.trim() : null,
        priority: f.priority,
        status: f.status
      }));

  const buildCreateFollowPayload = () =>
    followUps
      .filter((f) => f.title.trim() && f.description.trim())
      .map((f) => ({
        title: f.title.trim(),
        description: f.description.trim(),
        owner: f.owner.trim() ? f.owner.trim() : null,
        priority: f.priority
      }));

  const savePayloadCore = useMemo(
    () => ({
      summary,
      nextShiftNotes,
      alertIds: Array.from(selectedAlertIds),
      incidentIds: Array.from(selectedIncidentIds)
    }),
    [summary, nextShiftNotes, selectedAlertIds, selectedIncidentIds]
  );

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (persistedId) {
        await updateHandover(persistedId, {
          ...savePayloadCore,
          followUpItems: buildFollowUpPayload()
        });
        return;
      }

      const res = await createHandover({
        shiftDate,
        shiftType,
        createdBy: createdBy.trim() || 'Operator',
        summary,
        nextShiftNotes,
        alertIds: savePayloadCore.alertIds,
        incidentIds: savePayloadCore.incidentIds,
        followUpItems: buildCreateFollowPayload()
      });
      setPersistedId(res.data.id);
      setFollowUps(
        res.data.followUpItems.map((f) => ({
          localKey: f.id,
          id: f.id,
          title: f.title,
          description: f.description,
          owner: f.owner ?? '',
          priority: f.priority,
          status: f.status
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkReady = async () => {
    if (!summary.trim()) {
      setError('Summary is required before marking as Ready.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      let id = persistedId;

      if (!id) {
        const res = await createHandover({
          shiftDate,
          shiftType,
          createdBy: createdBy.trim() || 'Operator',
          summary,
          nextShiftNotes,
          alertIds: savePayloadCore.alertIds,
          incidentIds: savePayloadCore.incidentIds,
          followUpItems: buildCreateFollowPayload()
        });
        id = res.data.id;
        setPersistedId(id);
        setFollowUps(
          res.data.followUpItems.map((f) => ({
            localKey: f.id,
            id: f.id,
            title: f.title,
            description: f.description,
            owner: f.owner ?? '',
            priority: f.priority,
            status: f.status
          }))
        );
      } else {
        await updateHandover(id, {
          ...savePayloadCore,
          followUpItems: buildFollowUpPayload()
        });
      }

      await updateHandoverStatus(id, { status: 'Ready' });
      onSaved(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to mark Ready');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-xl bg-ops-panel" />
        <div className="h-64 animate-pulse rounded-xl bg-ops-panel" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-ops-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-ops-border bg-ops-panel/80 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-ops-muted transition hover:text-ops-foreground"
          >
            ← Handovers
          </button>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ops-foreground md:text-3xl">
            {mode === 'edit' ? 'Edit handover' : 'Create handover'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ops-muted">
            Attach the signals that matter: suggested alerts and incidents are prioritized for this shift. Add explicit
            follow-ups so nothing gets dropped between desks.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-sev-critical/35 bg-sev-critical/10 px-4 py-3 text-sm text-sev-critical">
          {error}
        </div>
      ) : null}

      <section className="rounded-xl border border-ops-border bg-ops-panel/70 p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-semibold text-ops-foreground">Shift metadata</h2>
        <p className="mt-1 text-xs text-ops-muted">Who is signing out, which shift boundary, and the headline story.</p>
        <div className="mt-4">
          <HandoverForm
            shiftDate={shiftDate}
            shiftType={shiftType}
            createdBy={createdBy}
            summary={summary}
            nextShiftNotes={nextShiftNotes}
            onChange={mergeField}
            lockShiftMetadata={mode === 'edit'}
          />
        </div>
      </section>

      <section className="rounded-xl border border-ops-border bg-ops-panel/70 p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ops-foreground">Suggested alerts</h2>
            <p className="mt-1 text-xs text-ops-muted">New, acknowledged, or actively investigating — check to include.</p>
          </div>
        </div>
        <div className="mt-4">
          <SuggestedAlertsSelector
            alerts={suggestions?.alerts ?? []}
            selectedIds={selectedAlertIds}
            onToggle={toggleAlert}
          />
        </div>
      </section>

      <section className="rounded-xl border border-ops-border bg-ops-panel/70 p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-semibold text-ops-foreground">Suggested incidents</h2>
        <p className="mt-1 text-xs text-ops-muted">Open, investigating, or monitoring — separate from alert noise.</p>
        <div className="mt-4">
          <SuggestedIncidentsSelector
            incidents={suggestions?.incidents ?? []}
            selectedIds={selectedIncidentIds}
            onToggle={toggleIncident}
          />
        </div>
      </section>

      {suggestions && suggestions.openFollowUps.length > 0 ? (
        <section className="rounded-xl border border-state-open/25 bg-state-open/5 p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-semibold text-ops-foreground">Open follow-ups from active handovers</h2>
          <p className="mt-1 text-xs text-ops-muted">
            Context only — link related items in your summary. Selection is manual to avoid accidental coupling.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ops-muted">
            {suggestions.openFollowUps.slice(0, 8).map((f) => (
              <li key={f.id} className="rounded-lg border border-ops-border bg-ops-panel/80 px-3 py-2">
                <span className="font-medium text-ops-foreground">{f.title}</span>
                <span className="mx-2 text-ops-border">·</span>
                {f.handover.shiftType} {f.handover.shiftDate}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-ops-border bg-ops-panel/70 p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ops-foreground">Follow-up items</h2>
            <p className="mt-1 text-xs text-ops-muted">Concrete next actions with priority — these persist on the record.</p>
          </div>
          <button
            type="button"
            onClick={addFollowUp}
            className="rounded-lg border border-ops-border bg-ops-canvas px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-ops-foreground transition hover:border-state-open/40"
          >
            Add follow-up
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {followUps.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ops-border px-4 py-6 text-center text-sm text-ops-muted">
              No follow-up rows yet. Add one for anything the next shift must not miss.
            </p>
          ) : (
            followUps.map((item) => (
              <FollowUpItemEditor
                key={item.localKey}
                item={item}
                showStatus={mode === 'edit'}
                onChange={patchFollowUp}
                onRemove={removeFollowUp}
              />
            ))
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-ops-border pt-4">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSaveDraft()}
          className="rounded-lg border border-ops-border bg-ops-panel px-4 py-2.5 text-sm font-semibold text-ops-foreground transition hover:border-state-open/35 disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleMarkReady()}
          className="rounded-lg border border-state-open/40 bg-state-open/15 px-4 py-2.5 text-sm font-semibold text-state-open transition hover:bg-state-open/25 disabled:opacity-50"
        >
          Mark as Ready
        </button>
      </div>
    </div>
  );
}
