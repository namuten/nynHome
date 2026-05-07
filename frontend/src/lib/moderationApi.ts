import api from './api';

export interface ReportItem {
  id: number;
  commentId: number;
  reporterUserId: number;
  reason: string;
  description: string;
  status: string;
  resolutionNote?: string;
  resolvedByAdminId?: number;
  createdAt: string;
  reporterUser: { id: number; nickname: string; email: string };
  comment: { id: number; body: string; isHidden: boolean; userId: number };
}

export interface ReportsResponse {
  items: ReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerationQueueItem {
  queueId: string;
  kind: 'comment' | 'guestbook';
  targetId: number;
  contentBody: string;
  reporter: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  isHidden: boolean;
}

export async function fetchReports(params: { type?: string; status?: string; page?: number; limit?: number }) {
  const { data } = await api.get<ReportsResponse>('/admin/reports', { params });
  return data;
}

export async function updateReportStatus(type: string, id: number, payload: { status: string; resolutionNote?: string }) {
  const { data } = await api.patch(`/admin/reports/${type}/${id}/status`, payload);
  return data;
}

export async function fetchModerationQueue(params: { status?: string; kind?: string }) {
  const { data } = await api.get<ModerationQueueItem[]>('/admin/moderation/queue', { params });
  return data;
}

export async function moderateComment(id: number, payload: { isHidden: boolean; hiddenReason?: string }) {
  const { data } = await api.patch(`/admin/comments/${id}/moderation`, payload);
  return data;
}
