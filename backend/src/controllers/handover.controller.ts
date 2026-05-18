import type { NextFunction, Request, Response } from 'express';
import {
  createHandoverSchema,
  handoverIdParamsSchema,
  listHandoversQuerySchema,
  updateHandoverSchema,
  updateHandoverStatusBodySchema
} from '../validators/handover.validator';
import {
  createHandover,
  getCurrentShiftSuggestions,
  getHandoverById,
  listHandovers,
  updateHandover,
  updateHandoverStatus
} from '../services/handover.service';

export async function handleListHandovers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listHandoversQuerySchema.parse(req.query);
    const result = await listHandovers(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetHandoverSuggestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    void req;
    const result = await getCurrentShiftSuggestions();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetHandoverById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = handoverIdParamsSchema.parse(req.params);
    const result = await getHandoverById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleCreateHandover(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = createHandoverSchema.parse(req.body);
    const result = await createHandover(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateHandover(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = handoverIdParamsSchema.parse(req.params);
    const payload = updateHandoverSchema.parse(req.body);
    const result = await updateHandover(id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateHandoverStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = handoverIdParamsSchema.parse(req.params);
    const payload = updateHandoverStatusBodySchema.parse(req.body);
    const result = await updateHandoverStatus(id, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
