import type {
  Alert,
  HandoverFollowUpItem,
  Incident,
  ShiftHandover
} from '@prisma/client';
import { toAlertResponse } from './alert-serializer';

type HandoverWithRelations = ShiftHandover & {
  selectedAlerts: { alert: Alert }[];
  selectedIncidents: { incident: Incident }[];
  followUpItems: HandoverFollowUpItem[];
};

type HandoverListRow = ShiftHandover & {
  _count: {
    selectedAlerts: number;
    selectedIncidents: number;
    followUpItems: number;
  };
};

export function toShiftDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function serializeHandoverListItem(row: HandoverListRow) {
  return {
    id: row.id,
    shiftDate: toShiftDateString(row.shiftDate),
    shiftType: row.shiftType,
    createdBy: row.createdBy,
    status: row.status,
    summary: row.summary,
    nextShiftNotes: row.nextShiftNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    counts: {
      alerts: row._count.selectedAlerts,
      incidents: row._count.selectedIncidents,
      followUps: row._count.followUpItems
    }
  };
}

export function serializeHandoverDetail(handover: HandoverWithRelations) {
  return {
    id: handover.id,
    shiftDate: toShiftDateString(handover.shiftDate),
    shiftType: handover.shiftType,
    createdBy: handover.createdBy,
    status: handover.status,
    summary: handover.summary,
    nextShiftNotes: handover.nextShiftNotes,
    createdAt: handover.createdAt.toISOString(),
    updatedAt: handover.updatedAt.toISOString(),
    completedAt: handover.completedAt ? handover.completedAt.toISOString() : null,
    alerts: handover.selectedAlerts.map((row) => toAlertResponse(row.alert)),
    incidents: handover.selectedIncidents.map((row) => {
      const i = row.incident;
      return {
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
        resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null
      };
    }),
    followUpItems: handover.followUpItems.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      owner: item.owner,
      priority: item.priority,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
  };
}
