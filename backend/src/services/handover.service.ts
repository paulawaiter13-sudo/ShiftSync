import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/http-error';
import {
  serializeHandoverDetail,
  serializeHandoverListItem,
  toShiftDateString
} from '../lib/handover-serializer';
import { toAlertResponse } from '../lib/alert-serializer';
import type {
  CreateHandoverInput,
  ListHandoversQuery,
  UpdateHandoverInput,
  UpdateHandoverStatusInput,
  FollowUpPatchInput
} from '../validators/handover.validator';

const handoverDetailInclude = {
  selectedAlerts: {
    include: {
      alert: true
    }
  },
  selectedIncidents: {
    include: {
      incident: true
    }
  },
  followUpItems: {
    orderBy: {
      createdAt: 'asc' as const
    }
  }
} satisfies Prisma.ShiftHandoverInclude;

const handoverListInclude = {
  _count: {
    select: {
      selectedAlerts: true,
      selectedIncidents: true,
      followUpItems: true
    }
  }
} satisfies Prisma.ShiftHandoverInclude;

function normalizeShiftDate(input: Date | string): Date {
  const base = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(base.getTime())) {
    throw new HttpError(400, 'Invalid shiftDate');
  }

  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
}

function assertCanEditHandover(status: 'Draft' | 'Ready' | 'Completed') {
  if (status === 'Completed') {
    throw new HttpError(400, 'Completed handovers cannot be edited');
  }
}

function assertSummaryForReady(summary: string) {
  if (!summary.trim()) {
    throw new HttpError(400, 'Summary is required before marking a handover as Ready');
  }
}

function assertCompletePrerequisites(summary: string, createdBy: string, shiftDate: Date, shiftType: string) {
  if (!summary.trim()) {
    throw new HttpError(400, 'Summary is required before completing a handover');
  }

  if (!createdBy.trim()) {
    throw new HttpError(400, 'createdBy is required before completing a handover');
  }

  if (!shiftType) {
    throw new HttpError(400, 'shiftType is required before completing a handover');
  }

  if (!shiftDate || Number.isNaN(shiftDate.getTime())) {
    throw new HttpError(400, 'shiftDate is required before completing a handover');
  }
}

async function assertAlertsExist(alertIds: string[]) {
  if (alertIds.length === 0) {
    return;
  }

  const count = await prisma.alert.count({
    where: {
      id: {
        in: alertIds
      }
    }
  });

  if (count !== alertIds.length) {
    throw new HttpError(400, 'One or more alerts were not found');
  }
}

async function assertIncidentsExist(incidentIds: string[]) {
  if (incidentIds.length === 0) {
    return;
  }

  const count = await prisma.incident.count({
    where: {
      id: {
        in: incidentIds
      }
    }
  });

  if (count !== incidentIds.length) {
    throw new HttpError(400, 'One or more incidents were not found');
  }
}

const severityRank: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3
};

const alertStatusRank: Record<string, number> = {
  Investigating: 0,
  Acknowledged: 1,
  New: 2,
  Closed: 3
};

const incidentStatusRank: Record<string, number> = {
  Open: 0,
  Investigating: 1,
  Monitoring: 2,
  Resolved: 3,
  Closed: 4
};

const followUpPriorityRank: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3
};

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0));
}

export async function listHandovers(query: ListHandoversQuery) {
  const where: Prisma.ShiftHandoverWhereInput = {};
  const andClauses: Prisma.ShiftHandoverWhereInput[] = [];

  if (query.status) {
    andClauses.push({ status: query.status });
  }

  if (query.shiftType) {
    andClauses.push({ shiftType: query.shiftType });
  }

  if (query.shiftDate) {
    andClauses.push({
      shiftDate: normalizeShiftDate(query.shiftDate as Date | string)
    });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  const [rows, draftCount, readyCount, completedTodayCount, openFollowUpCount] = await Promise.all([
    prisma.shiftHandover.findMany({
      where,
      include: handoverListInclude,
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.shiftHandover.count({ where: { status: 'Draft' } }),
    prisma.shiftHandover.count({ where: { status: 'Ready' } }),
    prisma.shiftHandover.count({
      where: {
        status: 'Completed',
        completedAt: {
          gte: startOfUtcDay(new Date()),
          lt: endOfUtcDay(new Date())
        }
      }
    }),
    prisma.handoverFollowUpItem.count({
      where: {
        status: {
          in: ['Open', 'InProgress']
        }
      }
    })
  ]);

  return {
    data: rows.map(serializeHandoverListItem),
    meta: {
      total: rows.length,
      stats: {
        draftCount,
        readyCount,
        completedTodayCount,
        openFollowUpCount
      }
    }
  };
}

export async function getHandoverById(id: string) {
  const handover = await prisma.shiftHandover.findUnique({
    where: { id },
    include: handoverDetailInclude
  });

  if (!handover) {
    throw new HttpError(404, 'Handover not found');
  }

  return {
    data: serializeHandoverDetail(handover)
  };
}

export async function createHandover(input: CreateHandoverInput) {
  const shiftDate = normalizeShiftDate(input.shiftDate as Date | string);
  await assertAlertsExist(input.alertIds);
  await assertIncidentsExist(input.incidentIds);

  const handover = await prisma.shiftHandover.create({
    data: {
      shiftDate,
      shiftType: input.shiftType,
      createdBy: input.createdBy,
      status: 'Draft',
      summary: input.summary ?? '',
      nextShiftNotes: input.nextShiftNotes ?? '',
      selectedAlerts: {
        create: input.alertIds.map((alertId) => ({ alertId }))
      },
      selectedIncidents: {
        create: input.incidentIds.map((incidentId) => ({ incidentId }))
      },
      followUpItems: {
        create: input.followUpItems.map((item) => ({
          title: item.title,
          description: item.description,
          owner: item.owner ?? null,
          priority: item.priority,
          status: 'Open'
        }))
      }
    },
    include: handoverDetailInclude
  });

  return {
    data: serializeHandoverDetail(handover)
  };
}

async function syncFollowUpItems(handoverId: string, items: FollowUpPatchInput[]) {
  const existing = await prisma.handoverFollowUpItem.findMany({
    where: { handoverId }
  });

  const incomingIds = new Set(items.map((item) => item.id).filter(Boolean) as string[]);

  for (const row of existing) {
    if (!incomingIds.has(row.id)) {
      await prisma.handoverFollowUpItem.delete({
        where: { id: row.id }
      });
    }
  }

  for (const item of items) {
    if (item.id) {
      const owned = await prisma.handoverFollowUpItem.findFirst({
        where: {
          id: item.id,
          handoverId
        }
      });

      if (!owned) {
        throw new HttpError(400, 'Follow-up item does not belong to this handover');
      }

      await prisma.handoverFollowUpItem.update({
        where: { id: item.id },
        data: {
          title: item.title,
          description: item.description,
          owner: item.owner ?? null,
          priority: item.priority,
          status: item.status ?? undefined
        }
      });
    } else {
      await prisma.handoverFollowUpItem.create({
        data: {
          handoverId,
          title: item.title,
          description: item.description,
          owner: item.owner ?? null,
          priority: item.priority,
          status: item.status ?? 'Open'
        }
      });
    }
  }
}

async function syncAlertLinks(handoverId: string, alertIds: string[]) {
  if (alertIds.length === 0) {
    await prisma.handoverAlert.deleteMany({
      where: { handoverId }
    });
    return;
  }

  await prisma.handoverAlert.deleteMany({
    where: {
      handoverId,
      alertId: {
        notIn: alertIds
      }
    }
  });

  const existing = await prisma.handoverAlert.findMany({
    where: { handoverId }
  });
  const existingSet = new Set(existing.map((row) => row.alertId));

  for (const alertId of alertIds) {
    if (!existingSet.has(alertId)) {
      await prisma.handoverAlert.create({
        data: {
          handoverId,
          alertId
        }
      });
    }
  }
}

async function syncIncidentLinks(handoverId: string, incidentIds: string[]) {
  if (incidentIds.length === 0) {
    await prisma.handoverIncident.deleteMany({
      where: { handoverId }
    });
    return;
  }

  await prisma.handoverIncident.deleteMany({
    where: {
      handoverId,
      incidentId: {
        notIn: incidentIds
      }
    }
  });

  const existing = await prisma.handoverIncident.findMany({
    where: { handoverId }
  });
  const existingSet = new Set(existing.map((row) => row.incidentId));

  for (const incidentId of incidentIds) {
    if (!existingSet.has(incidentId)) {
      await prisma.handoverIncident.create({
        data: {
          handoverId,
          incidentId
        }
      });
    }
  }
}

export async function updateHandover(id: string, input: UpdateHandoverInput) {
  const existing = await prisma.shiftHandover.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new HttpError(404, 'Handover not found');
  }

  assertCanEditHandover(existing.status);

  if (input.status === 'Ready') {
    const summaryForReady = input.summary ?? existing.summary;
    assertSummaryForReady(summaryForReady);
  }

  if (input.status === 'Completed') {
    assertCompletePrerequisites(
      input.summary ?? existing.summary,
      existing.createdBy,
      existing.shiftDate,
      existing.shiftType
    );
  }

  if (input.alertIds) {
    await assertAlertsExist(input.alertIds);
  }

  if (input.incidentIds) {
    await assertIncidentsExist(input.incidentIds);
  }

  await prisma.$transaction(async () => {
    await prisma.shiftHandover.update({
      where: { id },
      data: {
        summary: input.summary,
        nextShiftNotes: input.nextShiftNotes,
        status: input.status,
        completedAt:
          input.status === 'Completed'
            ? existing.completedAt ?? new Date()
            : input.status === 'Draft' || input.status === 'Ready'
              ? null
              : undefined
      }
    });

    if (input.alertIds) {
      await syncAlertLinks(id, input.alertIds);
    }

    if (input.incidentIds) {
      await syncIncidentLinks(id, input.incidentIds);
    }

    if (input.followUpItems) {
      await syncFollowUpItems(id, input.followUpItems);
    }
  });

  const handover = await prisma.shiftHandover.findUniqueOrThrow({
    where: { id },
    include: handoverDetailInclude
  });

  return {
    data: serializeHandoverDetail(handover)
  };
}

export async function updateHandoverStatus(id: string, input: UpdateHandoverStatusInput) {
  const existing = await prisma.shiftHandover.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new HttpError(404, 'Handover not found');
  }

  if (existing.status === 'Completed') {
    throw new HttpError(400, 'Completed handovers cannot change status');
  }

  if (input.status === 'Ready') {
    assertSummaryForReady(existing.summary);
  }

  if (input.status === 'Completed') {
    assertCompletePrerequisites(
      existing.summary,
      existing.createdBy,
      existing.shiftDate,
      existing.shiftType
    );
  }

  const handover = await prisma.shiftHandover.update({
    where: { id },
    data: {
      status: input.status,
      completedAt:
        input.status === 'Completed' ? existing.completedAt ?? new Date() : null
    },
    include: handoverDetailInclude
  });

  return {
    data: serializeHandoverDetail(handover)
  };
}

export async function getCurrentShiftSuggestions() {
  const [alerts, incidents, followUpRows] = await Promise.all([
    prisma.alert.findMany({
      where: {
        status: {
          in: ['New', 'Acknowledged', 'Investigating']
        }
      }
    }),
    prisma.incident.findMany({
      where: {
        status: {
          in: ['Open', 'Investigating', 'Monitoring']
        }
      }
    }),
    prisma.handoverFollowUpItem.findMany({
      where: {
        status: {
          in: ['Open', 'InProgress']
        },
        handover: {
          status: {
            in: ['Draft', 'Ready']
          }
        }
      },
      include: {
        handover: {
          select: {
            id: true,
            shiftDate: true,
            shiftType: true,
            status: true
          }
        }
      }
    })
  ]);

  const sortedAlerts = [...alerts].sort((a, b) => {
    const sev = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    if (sev !== 0) {
      return sev;
    }

    const st = (alertStatusRank[a.status] ?? 9) - (alertStatusRank[b.status] ?? 9);
    if (st !== 0) {
      return st;
    }

    return b.triggeredAt.getTime() - a.triggeredAt.getTime();
  });

  const sortedIncidents = [...incidents].sort((a, b) => {
    const st = (incidentStatusRank[a.status] ?? 9) - (incidentStatusRank[b.status] ?? 9);
    if (st !== 0) {
      return st;
    }

    const sev = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
    if (sev !== 0) {
      return sev;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const sortedFollowUps = [...followUpRows].sort((a, b) => {
    const pr =
      (followUpPriorityRank[a.priority] ?? 9) - (followUpPriorityRank[b.priority] ?? 9);
    if (pr !== 0) {
      return pr;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return {
    data: {
      alerts: sortedAlerts.map((alert) => toAlertResponse(alert)),
      incidents: sortedIncidents.map((incident) => ({
        ...incident,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        resolvedAt: incident.resolvedAt ? incident.resolvedAt.toISOString() : null
      })),
      openFollowUps: sortedFollowUps.map((item) => ({
        id: item.id,
        handoverId: item.handoverId,
        title: item.title,
        description: item.description,
        owner: item.owner,
        priority: item.priority,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        handover: {
          id: item.handover.id,
          shiftDate: toShiftDateString(item.handover.shiftDate),
          shiftType: item.handover.shiftType,
          status: item.handover.status
        }
      }))
    }
  };
}
