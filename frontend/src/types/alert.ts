export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'New' | 'Acknowledged' | 'Investigating' | 'Closed';
export type InvestigationNoteType = 'Note' | 'Action' | 'Escalation' | 'Update';

export interface Alert {
  id: string;
  title: string;
  description: string;
  source: string;
  service: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: string;
  acknowledgedBy: string | null;
  investigationStartedAt: string | null;
  lastUpdatedBy: string | null;
  relatedIncidentId: string | null;
  shiftDate: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationNote {
  id: string;
  alertId: string;
  message: string;
  type: InvestigationNoteType;
  createdBy: string;
  createdAt: string;
}

export interface AlertsResponse {
  data: Alert[];
  meta: {
    total: number;
  };
}

export interface AlertResponse {
  data: Alert;
}

export interface InvestigationNotesResponse {
  data: InvestigationNote[];
}

export interface InvestigationNoteResponse {
  data: InvestigationNote;
  alert?: Alert;
}

export interface AlertFilters {
  search: string;
  status: '' | AlertStatus;
  severity: '' | AlertSeverity;
  source: string;
}

export interface CreateAlertPayload {
  title: string;
  description: string;
  source: string;
  service: string;
  severity: AlertSeverity;
  status?: AlertStatus;
  triggeredAt: string;
  shiftDate: string;
  acknowledgedBy?: string | null;
  tags?: string[];
}

export interface UpdateAlertStatusPayload {
  status: AlertStatus;
  acknowledgedBy?: string;
  updatedBy?: string;
}

export interface AcknowledgeAlertPayload {
  acknowledgedBy: string;
}

export interface CreateInvestigationNotePayload {
  message: string;
  type: InvestigationNoteType;
  createdBy: string;
}

export const ALERT_SEVERITIES: AlertSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
export const ALERT_STATUSES: AlertStatus[] = ['New', 'Acknowledged', 'Investigating', 'Closed'];
export const INVESTIGATION_NOTE_TYPES: InvestigationNoteType[] = [
  'Note',
  'Action',
  'Escalation',
  'Update'
];
