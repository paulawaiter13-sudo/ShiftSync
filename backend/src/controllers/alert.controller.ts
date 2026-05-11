import type { NextFunction, Request, Response } from 'express';
import {
  acknowledgeAlertSchema,
  alertIdParamsSchema,
  createInvestigationNoteSchema,
  createAlertSchema,
  listAlertsQuerySchema,
  updateAlertStatusSchema
} from '../validators/alert.validator';
import {
  acknowledgeAlert,
  createAlert,
  getAlertById,
  listAlerts,
  updateAlertStatus
} from '../services/alert.service';
import {
  createInvestigationNote,
  listInvestigationNotes
} from '../services/investigation-note.service';

export async function handleListAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAlertsQuerySchema.parse(req.query);
    const result = await listAlerts(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetAlertById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = alertIdParamsSchema.parse(req.params);
    const result = await getAlertById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleCreateAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createAlertSchema.parse(req.body);
    const result = await createAlert(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateAlertStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = alertIdParamsSchema.parse(req.params);
    const payload = updateAlertStatusSchema.parse(req.body);
    const result = await updateAlertStatus(id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleAcknowledgeAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = alertIdParamsSchema.parse(req.params);
    const payload = acknowledgeAlertSchema.parse(req.body);
    const result = await acknowledgeAlert(id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleListInvestigationNotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = alertIdParamsSchema.parse(req.params);
    const result = await listInvestigationNotes(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleCreateInvestigationNote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = alertIdParamsSchema.parse(req.params);
    const payload = createInvestigationNoteSchema.parse(req.body);
    const result = await createInvestigationNote(id, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
