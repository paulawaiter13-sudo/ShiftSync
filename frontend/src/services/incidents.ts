import type {
  CreateIncidentFromAlertPayload,
  CreateIncidentFromAlertResponse,
  CreateIncidentPayload,
  IncidentFilters,
  IncidentResponse,
  IncidentsResponse,
  UpdateIncidentStatusPayload
} from '../types/incident';
import { request } from './api';

export async function fetchIncidents(filters: IncidentFilters): Promise<IncidentsResponse> {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.severity) {
    params.set('severity', filters.severity);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  const queryString = params.toString();
  return request<IncidentsResponse>(`/incidents${queryString ? `?${queryString}` : ''}`);
}

export async function fetchIncidentById(incidentId: string): Promise<IncidentResponse> {
  return request<IncidentResponse>(`/incidents/${incidentId}`);
}

export async function createIncident(payload: CreateIncidentPayload): Promise<IncidentResponse> {
  return request<IncidentResponse>('/incidents', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createIncidentFromAlert(
  alertId: string,
  payload: CreateIncidentFromAlertPayload
): Promise<CreateIncidentFromAlertResponse> {
  return request<CreateIncidentFromAlertResponse>(`/incidents/from-alert/${alertId}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateIncidentStatus(
  incidentId: string,
  payload: UpdateIncidentStatusPayload
): Promise<IncidentResponse> {
  return request<IncidentResponse>(`/incidents/${incidentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
