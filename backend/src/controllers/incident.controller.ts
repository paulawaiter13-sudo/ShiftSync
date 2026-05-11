import type { NextFunction, Request, Response } from 'express';
import {
  createIncidentFromAlertParamsSchema,
  createIncidentFromAlertSchema,
  createIncidentSchema,
  incidentIdParamsSchema,
  listIncidentsQuerySchema,
  updateIncidentStatusSchema
} from '../validators/incident.validator';
import {
  createIncident,
  createIncidentFromAlert,
  getIncidentById,
  listIncidents,
  updateIncidentStatus
} from '../services/incident.service';

export async function handleCreateIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createIncidentSchema.parse(req.body);
    const result = await createIncident(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleCreateIncidentFromAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { alertId } = createIncidentFromAlertParamsSchema.parse(req.params);
    const payload = createIncidentFromAlertSchema.parse(req.body);
    const result = await createIncidentFromAlert(alertId, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleListIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listIncidentsQuerySchema.parse(req.query);
    const result = await listIncidents(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetIncidentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = incidentIdParamsSchema.parse(req.params);
    const result = await getIncidentById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateIncidentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = incidentIdParamsSchema.parse(req.params);
    const payload = updateIncidentStatusSchema.parse(req.body);
    const result = await updateIncidentStatus(id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
