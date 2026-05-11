import type {
  AcknowledgeAlertPayload,
  AlertFilters,
  AlertResponse,
  AlertsResponse,
  CreateInvestigationNotePayload,
  CreateAlertPayload,
  InvestigationNoteResponse,
  InvestigationNotesResponse,
  UpdateAlertStatusPayload
} from '../types/alert';
import { request } from './api';

export async function fetchAlerts(filters: AlertFilters): Promise<AlertsResponse> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.severity) {
    params.set('severity', filters.severity);
  }

  if (filters.source) {
    params.set('source', filters.source);
  }

  params.set('sort', 'desc');

  const queryString = params.toString();
  return request<AlertsResponse>(`/alerts${queryString ? `?${queryString}` : ''}`);
}

export async function fetchAlertById(alertId: string): Promise<AlertResponse> {
  return request<AlertResponse>(`/alerts/${alertId}`);
}

export async function fetchAlertNotes(alertId: string): Promise<InvestigationNotesResponse> {
  return request<InvestigationNotesResponse>(`/alerts/${alertId}/notes`);
}

export async function createAlert(payload: CreateAlertPayload): Promise<AlertResponse> {
  return request<AlertResponse>('/alerts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateAlertStatus(
  alertId: string,
  payload: UpdateAlertStatusPayload
): Promise<AlertResponse> {
  return request<AlertResponse>(`/alerts/${alertId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function acknowledgeAlert(
  alertId: string,
  payload: AcknowledgeAlertPayload
): Promise<AlertResponse> {
  return request<AlertResponse>(`/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function createAlertNote(
  alertId: string,
  payload: CreateInvestigationNotePayload
): Promise<InvestigationNoteResponse> {
  return request<InvestigationNoteResponse>(`/alerts/${alertId}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
