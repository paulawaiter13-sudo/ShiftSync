import { z } from 'zod';

export const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }

  return value;
};

export const optionalText = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional()
);

export const severitySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);
