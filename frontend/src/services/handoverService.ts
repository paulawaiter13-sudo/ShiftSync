import type {
  CreateHandoverPayload,
  HandoverListFilters,
  HandoverResponse,
  HandoversListResponse,
  HandoverSuggestionsResponse,
  UpdateHandoverPayload,
  UpdateHandoverStatusPayload
} from '../types/handover';
import { request } from './api';

export async function fetchHandovers(filters?: HandoverListFilters): Promise<HandoversListResponse> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set('status', filters.status);
  }

  if (filters?.shiftType) {
    params.set('shiftType', filters.shiftType);
  }

  if (filters?.shiftDate?.trim()) {
    params.set('shiftDate', filters.shiftDate.trim());
  }

  const query = params.toString();
  return request<HandoversListResponse>(`/handovers${query ? `?${query}` : ''}`);
}

export async function fetchHandoverById(handoverId: string): Promise<HandoverResponse> {
  return request<HandoverResponse>(`/handovers/${encodeURIComponent(handoverId)}`);
}

export async function fetchHandoverSuggestions(): Promise<HandoverSuggestionsResponse> {
  return request<HandoverSuggestionsResponse>('/handovers/suggestions/current-shift');
}

export async function createHandover(payload: CreateHandoverPayload): Promise<HandoverResponse> {
  return request<HandoverResponse>('/handovers', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateHandover(
  handoverId: string,
  payload: UpdateHandoverPayload
): Promise<HandoverResponse> {
  return request<HandoverResponse>(`/handovers/${encodeURIComponent(handoverId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function updateHandoverStatus(
  handoverId: string,
  payload: UpdateHandoverStatusPayload
): Promise<HandoverResponse> {
  return request<HandoverResponse>(`/handovers/${encodeURIComponent(handoverId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
