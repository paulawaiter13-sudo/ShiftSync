import type { Alert } from './alert';
import type { Incident } from './incident';

export type ShiftType = 'Morning' | 'Evening' | 'Night';
export type HandoverStatus = 'Draft' | 'Ready' | 'Completed';
export type FollowUpPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FollowUpStatus = 'Open' | 'InProgress' | 'Done';

export interface HandoverListRow {
  id: string;
  shiftDate: string;
  shiftType: ShiftType;
  createdBy: string;
  status: HandoverStatus;
  summary: string;
  nextShiftNotes: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  counts: {
    alerts: number;
    incidents: number;
    followUps: number;
  };
}

export interface HandoverFollowUpItem {
  id: string;
  title: string;
  description: string;
  owner: string | null;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverDetail {
  id: string;
  shiftDate: string;
  shiftType: ShiftType;
  createdBy: string;
  status: HandoverStatus;
  summary: string;
  nextShiftNotes: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  alerts: Alert[];
  incidents: Incident[];
  followUpItems: HandoverFollowUpItem[];
}

export interface SuggestedOpenFollowUp {
  id: string;
  handoverId: string;
  title: string;
  description: string;
  owner: string | null;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
  handover: {
    id: string;
    shiftDate: string;
    shiftType: ShiftType;
    status: HandoverStatus;
  };
}

export interface HandoverSuggestions {
  alerts: Alert[];
  incidents: Incident[];
  openFollowUps: SuggestedOpenFollowUp[];
}

export interface HandoversListResponse {
  data: HandoverListRow[];
  meta: {
    total: number;
    stats: {
      draftCount: number;
      readyCount: number;
      completedTodayCount: number;
      openFollowUpCount: number;
    };
  };
}

export interface HandoverResponse {
  data: HandoverDetail;
}

export interface HandoverSuggestionsResponse {
  data: HandoverSuggestions;
}

export interface CreateHandoverPayload {
  shiftDate: string;
  shiftType: ShiftType;
  createdBy: string;
  summary?: string;
  nextShiftNotes?: string;
  alertIds?: string[];
  incidentIds?: string[];
  followUpItems?: CreateFollowUpPayload[];
}

export interface CreateFollowUpPayload {
  title: string;
  description: string;
  owner?: string | null;
  priority: FollowUpPriority;
}

export interface PatchFollowUpPayload {
  id?: string;
  title: string;
  description: string;
  owner?: string | null;
  priority: FollowUpPriority;
  status?: FollowUpStatus;
}

export interface UpdateHandoverPayload {
  summary?: string;
  nextShiftNotes?: string;
  status?: HandoverStatus;
  alertIds?: string[];
  incidentIds?: string[];
  followUpItems?: PatchFollowUpPayload[];
}

export interface UpdateHandoverStatusPayload {
  status: HandoverStatus;
}

export interface HandoverListFilters {
  status: '' | HandoverStatus;
  shiftType: '' | ShiftType;
  shiftDate: string;
}

export const SHIFT_TYPES: ShiftType[] = ['Morning', 'Evening', 'Night'];
export const HANDOVER_STATUSES: HandoverStatus[] = ['Draft', 'Ready', 'Completed'];
export const FOLLOW_UP_PRIORITIES: FollowUpPriority[] = ['Low', 'Medium', 'High', 'Critical'];
export const FOLLOW_UP_STATUSES: FollowUpStatus[] = ['Open', 'InProgress', 'Done'];
