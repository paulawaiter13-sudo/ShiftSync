import { ZodError } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null
    });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Internal server error'
  });
}
