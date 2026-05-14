import { z } from 'zod';
import { emptyStringToUndefined, severitySchema } from './shared';

const incidentStatusSchema = z.enum(['Open', 'Investigating', 'Monitoring', 'Resolved', 'Closed']);
const incidentCategorySchema = z.enum([
  'Infrastructure',
  'Network',
  'Application',
  'Security',
  'Database',
  'ThirdParty',
  'Other'
]);
const incidentEnvironmentSchema = z.enum(['Production', 'Staging', 'Internal', 'Other']);

export const listIncidentsQuerySchema = z.object({
  status: z.preprocess(emptyStringToUndefined, incidentStatusSchema.optional()),
  severity: z.preprocess(emptyStringToUndefined, severitySchema.optional()),
  category: z.preprocess(emptyStringToUndefined, incidentCategorySchema.optional())
});

const baseIncidentSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(2000),
  category: incidentCategorySchema,
  severity: severitySchema,
  affectedService: z.string().trim().min(2).max(100),
  environment: incidentEnvironmentSchema,
  reportedBy: z.string().trim().min(2).max(80),
  assignedTo: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().min(2).max(80).nullable().optional()
  )
});

export const createIncidentSchema = baseIncidentSchema.extend({
  status: incidentStatusSchema
});

export const createIncidentFromAlertParamsSchema = z.object({
  alertId: z.string().trim().min(1)
});

export const createIncidentFromAlertSchema = baseIncidentSchema.partial({
  title: true,
  description: true,
  severity: true,
  affectedService: true
});

export const incidentIdParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export const updateIncidentStatusSchema = z.object({
  status: incidentStatusSchema
});

export type IncidentStatus = z.infer<typeof incidentStatusSchema>;
export type IncidentCategory = z.infer<typeof incidentCategorySchema>;
export type IncidentEnvironment = z.infer<typeof incidentEnvironmentSchema>;
export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type CreateIncidentFromAlertInput = z.infer<typeof createIncidentFromAlertSchema>;
export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>;
