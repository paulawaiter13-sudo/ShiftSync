import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/http-error';
import { toAlertResponse } from '../lib/alert-serializer';
import type { CreateInvestigationNoteInput } from '../validators/alert.validator';

const toInvestigationNoteResponse = <T>(note: T) => note;

async function ensureAlertExists(alertId: string) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId }
  });

  if (!alert) {
    throw new HttpError(404, 'Alert not found');
  }

  return alert;
}

export async function listInvestigationNotes(alertId: string) {
  await ensureAlertExists(alertId);

  const notes = await prisma.investigationNote.findMany({
    where: { alertId },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return {
    data: notes.map(toInvestigationNoteResponse)
  };
}

export async function createInvestigationNote(
  alertId: string,
  input: CreateInvestigationNoteInput
) {
  const result = await prisma.$transaction(async (tx) => {
    const alert = await tx.alert.findUnique({
      where: { id: alertId }
    });

    if (!alert) {
      throw new HttpError(404, 'Alert not found');
    }

    if (alert.status === 'Closed') {
      throw new HttpError(400, 'Cannot add investigation note to a closed alert');
    }

    const existingNoteCount = await tx.investigationNote.count({
      where: { alertId }
    });

    const note = await tx.investigationNote.create({
      data: {
        alertId,
        message: input.message,
        type: input.type,
        createdBy: input.createdBy
      }
    });

    const shouldAdvanceToInvestigating =
      existingNoteCount === 0 && alert.status !== 'Investigating';

    const updatedAlert = await tx.alert.update({
      where: { id: alertId },
      data: {
        status: shouldAdvanceToInvestigating ? 'Investigating' : alert.status,
        investigationStartedAt:
          shouldAdvanceToInvestigating && !alert.investigationStartedAt
            ? note.createdAt
            : alert.investigationStartedAt,
        lastUpdatedBy: input.createdBy
      }
    });

    return {
      note,
      alert: updatedAlert
    };
  });

  return {
    data: toInvestigationNoteResponse(result.note),
    alert: toAlertResponse(result.alert)
  };
}
