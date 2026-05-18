import { z } from 'zod';
import { emptyStringToUndefined } from './shared';

export const shiftTypeSchema = z.enum(['Morning', 'Evening', 'Night']);
export const handoverStatusSchema = z.enum(['Draft', 'Ready', 'Completed']);
export const followUpPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);
export const followUpStatusSchema = z.enum(['Open', 'InProgress', 'Done']);

const shiftDateInputSchema = z.union([
  z.string().trim().min(1),
  z.coerce.date()
]);

export const listHandoversQuerySchema = z.object({
  status: z.preprocess(emptyStringToUndefined, handoverStatusSchema.optional()),
  shiftType: z.preprocess(emptyStringToUndefined, shiftTypeSchema.optional()),
  shiftDate: z.preprocess(emptyStringToUndefined, shiftDateInputSchema.optional())
});

const followUpCreateInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  owner: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).max(120).nullable().optional()
  ),
  priority: followUpPrioritySchema
});

const followUpPatchInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  owner: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(1).max(120).nullable().optional()
  ),
  priority: followUpPrioritySchema,
  status: followUpStatusSchema.optional()
});

export const createHandoverSchema = z.object({
  shiftDate: shiftDateInputSchema,
  shiftType: shiftTypeSchema,
  createdBy: z.string().trim().min(1).max(120),
  summary: z.string().trim().max(8000).optional().default(''),
  nextShiftNotes: z.string().trim().max(8000).optional().default(''),
  alertIds: z.array(z.string().trim().min(1)).optional().default([]),
  incidentIds: z.array(z.string().trim().min(1)).optional().default([]),
  followUpItems: z.array(followUpCreateInputSchema).optional().default([])
});

export const updateHandoverSchema = z
  .object({
    summary: z.string().trim().max(8000).optional(),
    nextShiftNotes: z.string().trim().max(8000).optional(),
    status: handoverStatusSchema.optional(),
    alertIds: z.array(z.string().trim().min(1)).optional(),
    incidentIds: z.array(z.string().trim().min(1)).optional(),
    followUpItems: z.array(followUpPatchInputSchema).optional()
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' });

export const handoverIdParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export const updateHandoverStatusBodySchema = z.object({
  status: handoverStatusSchema
});

export type ListHandoversQuery = z.infer<typeof listHandoversQuerySchema>;
export type CreateHandoverInput = z.infer<typeof createHandoverSchema>;
export type UpdateHandoverInput = z.infer<typeof updateHandoverSchema>;
export type UpdateHandoverStatusInput = z.infer<typeof updateHandoverStatusBodySchema>;
export type FollowUpPatchInput = z.infer<typeof followUpPatchInputSchema>;
