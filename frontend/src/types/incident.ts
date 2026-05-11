import type { AlertSeverity } from './alert';

export type IncidentStatus = 'Open' | 'Investigating' | 'Monitoring' | 'Resolved' | 'Closed';
export type IncidentCategory =
  | 'Infrastructure'
  | 'Network'
  | 'Application'
  | 'Security'
  | 'Database'
  | 'Third-Party'
  | 'Other';
export type IncidentEnvironment = 'Production' | 'Staging' | 'Internal' | 'Other';

export interface IncidentSourceAlertSummary {
  id: string;
  title: string;
  status: string;
  severity: AlertSeverity;
  service: string;
  relatedIncidentId: string | null;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: AlertSeverity;
  status: IncidentStatus;
  affectedService: string;
  environment: IncidentEnvironment;
  reportedBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  sourceAlertId: string | null;
  sourceAlert?: IncidentSourceAlertSummary | null;
}

export interface IncidentFilters {
  status: '' | IncidentStatus;
  severity: '' | AlertSeverity;
  category: '' | IncidentCategory;
}

export interface IncidentsResponse {
  data: Incident[];
  meta: {
    total: number;
  };
}

export interface IncidentResponse {
  data: Incident;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: AlertSeverity;
  affectedService: string;
  environment: IncidentEnvironment;
  reportedBy: string;
  assignedTo?: string | null;
  status?: IncidentStatus;
}

export interface CreateIncidentFromAlertPayload {
  title?: string;
  description?: string;
  category: IncidentCategory;
  severity?: AlertSeverity;
  affectedService?: string;
  environment: IncidentEnvironment;
  reportedBy: string;
  assignedTo?: string | null;
}

export interface CreateIncidentFromAlertResponse extends IncidentResponse {
  alert: {
    id: string;
    relatedIncidentId: string | null;
    status: string;
    acknowledgedBy: string | null;
    investigationStartedAt: string | null;
    lastUpdatedBy: string | null;
  };
}

export interface UpdateIncidentStatusPayload {
  status: IncidentStatus;
}

export const INCIDENT_STATUSES: IncidentStatus[] = [
  'Open',
  'Investigating',
  'Monitoring',
  'Resolved',
  'Closed'
];

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Infrastructure',
  'Network',
  'Application',
  'Security',
  'Database',
  'Third-Party',
  'Other'
];

export const INCIDENT_ENVIRONMENTS: IncidentEnvironment[] = [
  'Production',
  'Staging',
  'Internal',
  'Other'
];
