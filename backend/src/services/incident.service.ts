import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/http-error';
import { toAlertResponse } from '../lib/alert-serializer';
import type {
  CreateIncidentFromAlertInput,
  CreateIncidentInput,
  ListIncidentsQuery,
  UpdateIncidentStatusInput
} from '../validators/incident.validator';

const incidentDetailInclude = {
  sourceAlert: {
    select: {
      id: true,
      title: true,
      status: true,
      severity: true,
      service: true,
      relatedIncidentId: true
    }
  }
} satisfies Prisma.IncidentInclude;

export async function createIncident(input: CreateIncidentInput) {
  const incident = await prisma.incident.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      status: input.status,
      affectedService: input.affectedService,
      environment: input.environment,
      reportedBy: input.reportedBy,
      assignedTo: input.assignedTo ?? null
    }
  });

  return {
    data: incident
  };
}

export async function createIncidentFromAlert(
  alertId: string,
  input: CreateIncidentFromAlertInput
) {
  const result = await prisma.$transaction(async (tx) => {
    const alert = await tx.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      throw new HttpError(404, 'Alert not found');
    }

    if (alert.status === 'Closed') {
      throw new HttpError(400, 'Cannot declare an incident from a closed alert');
    }

    if (alert.relatedIncidentId) {
      throw new HttpError(400, 'This alert is already linked to an incident');
    }

    const existingIncident = await tx.incident.findFirst({
      where: {
        sourceAlertId: alertId
      }
    });

    if (existingIncident) {
      throw new HttpError(400, 'This alert already has a source incident');
    }

    const incident = await tx.incident.create({
      data: {
        title: input.title ?? alert.title,
        description: input.description ?? alert.description,
        category: input.category,
        severity: input.severity ?? alert.severity,
        status: 'Open',
        affectedService: input.affectedService ?? alert.service,
        environment: input.environment,
        reportedBy: input.reportedBy,
        assignedTo: input.assignedTo ?? null,
        sourceAlertId: alert.id
      }
    });

    const updatedAlert = await tx.alert.update({
      where: { id: alert.id },
      data: {
        relatedIncidentId: incident.id,
        status: 'Investigating',
        acknowledgedBy: alert.acknowledgedBy ?? input.reportedBy,
        investigationStartedAt: alert.investigationStartedAt ?? new Date(),
        lastUpdatedBy: input.reportedBy
      }
    });

    return {
      incident,
      alert: updatedAlert
    };
  });

  return {
    data: result.incident,
    alert: toAlertResponse(result.alert)
  };
}

export async function listIncidents(query: ListIncidentsQuery) {
  const where: Prisma.IncidentWhereInput = {};
  const andClauses: Prisma.IncidentWhereInput[] = [];

  if (query.status) {
    andClauses.push({ status: query.status });
  }

  if (query.severity) {
    andClauses.push({ severity: query.severity });
  }

  if (query.category) {
    andClauses.push({ category: query.category });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    data: incidents,
    meta: {
      total: incidents.length
    }
  };
}

export async function getIncidentById(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: incidentDetailInclude
  });

  if (!incident) {
    throw new HttpError(404, 'Incident not found');
  }

  return {
    data: incident
  };
}

export async function updateIncidentStatus(id: string, input: UpdateIncidentStatusInput) {
  const existingIncident = await prisma.incident.findUnique({
    where: { id }
  });

  if (!existingIncident) {
    throw new HttpError(404, 'Incident not found');
  }

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: input.status,
      resolvedAt:
        input.status === 'Resolved'
          ? existingIncident.resolvedAt ?? new Date()
          : input.status === 'Closed'
            ? existingIncident.resolvedAt
            : null
    },
    include: incidentDetailInclude
  });

  return {
    data: incident
  };
}
