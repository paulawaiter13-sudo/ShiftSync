import { z } from 'zod';
import { emptyStringToUndefined, optionalText, severitySchema } from './shared';
const statusSchema = z.enum(['New', 'Acknowledged', 'Investigating', 'Closed']);
const investigationNoteTypeSchema = z.enum(['Note', 'Action', 'Escalation', 'Update']);

export const listAlertsQuerySchema = z.object({
  status: z.preprocess(emptyStringToUndefined, statusSchema.optional()),
  severity: z.preprocess(emptyStringToUndefined, severitySchema.optional()),
  source: optionalText,
  service: optionalText,
  search: optionalText,
  sort: z.preprocess(
    emptyStringToUndefined,
    z.enum(['asc', 'desc']).optional().default('desc')
  )
});

export const createAlertSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(1200),
  source: z.string().trim().min(2).max(80),
  service: z.string().trim().min(2).max(80),
  severity: severitySchema,
  status: statusSchema.optional().default('New'),
  triggeredAt: z.string().datetime(),
  shiftDate: z.string().datetime(),
  acknowledgedBy: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(2).max(80).nullable().optional()
  ),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional()
});

export const updateAlertStatusSchema = z.object({
  status: statusSchema,
  acknowledgedBy: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(2).max(80).optional()
  ),
  updatedBy: z.preprocess(emptyStringToUndefined, z.string().trim().min(2).max(80).optional())
});

export const acknowledgeAlertSchema = z.object({
  acknowledgedBy: z.string().trim().min(2).max(80)
});

export const createInvestigationNoteSchema = z.object({
  message: z.string().trim().min(3).max(1200),
  type: investigationNoteTypeSchema,
  createdBy: z.string().trim().min(2).max(80)
});

export const alertIdParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>;
export type CreateInvestigationNoteInput = z.infer<typeof createInvestigationNoteSchema>;
