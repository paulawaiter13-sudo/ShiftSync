import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/http-error';
import { serializeTags, toAlertResponse } from '../lib/alert-serializer';
import type {
  AcknowledgeAlertInput,
  CreateAlertInput,
  ListAlertsQuery,
  UpdateAlertStatusInput
} from '../validators/alert.validator';

const allowedStatusTransitions: Record<string, string[]> = {
  New: ['New', 'Acknowledged'],
  Acknowledged: ['Acknowledged', 'Investigating'],
  Investigating: ['Investigating', 'Closed'],
  Closed: ['Closed']
};

function assertValidStatusTransition(currentStatus: string, nextStatus: string) {
  const allowedTransitions = allowedStatusTransitions[currentStatus] ?? [];

  if (!allowedTransitions.includes(nextStatus)) {
    throw new HttpError(
      400,
      `Invalid alert status transition from ${currentStatus} to ${nextStatus}`
    );
  }
}

export async function listAlerts(query: ListAlertsQuery) {
  const where: Prisma.AlertWhereInput = {};
  const andClauses: Prisma.AlertWhereInput[] = [];

  if (query.status) {
    andClauses.push({ status: query.status });
  }

  if (query.severity) {
    andClauses.push({ severity: query.severity });
  }

  if (query.source) {
    andClauses.push({ source: query.source });
  }

  if (query.service) {
    andClauses.push({ service: query.service });
  }

  if (query.search) {
    andClauses.push({
      OR: [
        { title: { contains: query.search } },
        { service: { contains: query.search } }
      ]
    });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: {
      triggeredAt: query.sort ?? 'desc'
    }
  });

  return {
    data: alerts.map(toAlertResponse),
    meta: {
      total: alerts.length
    }
  };
}

export async function getAlertById(id: string) {
  const alert = await prisma.alert.findUnique({
    where: { id }
  });

  if (!alert) {
    throw new HttpError(404, 'Alert not found');
  }

  return {
    data: toAlertResponse(alert)
  };
}

export async function createAlert(input: CreateAlertInput) {
  const createdAlert = await prisma.alert.create({
    data: {
      title: input.title,
      description: input.description,
      source: input.source,
      service: input.service,
      severity: input.severity,
      status: input.status,
      triggeredAt: new Date(input.triggeredAt),
      shiftDate: new Date(input.shiftDate),
      acknowledgedBy: input.status === 'New' ? null : input.acknowledgedBy ?? null,
      investigationStartedAt:
        input.status === 'Investigating' ? new Date(input.triggeredAt) : null,
      lastUpdatedBy: input.acknowledgedBy ?? null,
      tags: serializeTags(input.tags)
    }
  });

  return {
    data: toAlertResponse(createdAlert)
  };
}

export async function updateAlertStatus(id: string, input: UpdateAlertStatusInput) {
  const existingAlert = await prisma.alert.findUnique({
    where: { id }
  });

  if (!existingAlert) {
    throw new HttpError(404, 'Alert not found');
  }

  assertValidStatusTransition(existingAlert.status, input.status);

  const updatedAlert = await prisma.alert.update({
    where: { id },
    data: {
      status: input.status,
      acknowledgedBy:
        input.acknowledgedBy ??
        (input.status === 'Acknowledged'
          ? existingAlert.acknowledgedBy ?? 'Shift Operator'
          : existingAlert.acknowledgedBy),
      investigationStartedAt:
        input.status === 'Investigating'
          ? existingAlert.investigationStartedAt ?? new Date()
          : existingAlert.investigationStartedAt,
      lastUpdatedBy: input.updatedBy ?? existingAlert.lastUpdatedBy
    }
  });

  return {
    data: toAlertResponse(updatedAlert)
  };
}

export async function acknowledgeAlert(id: string, input: AcknowledgeAlertInput) {
  const existingAlert = await prisma.alert.findUnique({
    where: { id }
  });

  if (!existingAlert) {
    throw new HttpError(404, 'Alert not found');
  }

  if (existingAlert.status === 'Closed') {
    throw new HttpError(400, 'Closed alerts cannot be acknowledged');
  }

  if (existingAlert.status === 'Investigating') {
    throw new HttpError(400, 'Alert is already under investigation');
  }

  const updatedAlert = await prisma.alert.update({
    where: { id },
    data: {
      status: 'Acknowledged',
      acknowledgedBy: input.acknowledgedBy,
      investigationStartedAt: existingAlert.investigationStartedAt ?? new Date(),
      lastUpdatedBy: input.acknowledgedBy
    }
  });

  return {
    data: toAlertResponse(updatedAlert)
  };
}
