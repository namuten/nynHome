import api from './api';

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  resourceType?: string;
}

export interface AnalyticsQueryParams {
  from?: string;
  to?: string;
  limit?: number;
  eventName?: string;
}

export interface BackupRunItem {
  id: number;
  backupType: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  fileUrl: string | null;
  checksum: string | null;
  sizeBytes: number | null;
  startedAt: string;
  finishedAt: string | null;
  errorMessage: string | null;
}

export interface PaginatedBackupRuns {
  items: BackupRunItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemHealthMetrics {
  database: 'ok' | 'error';
  storage: 'ok' | 'error';
  uptimeSeconds: number;
  version: string;
}

export async function getAdminAnalyticsSummary(params?: AnalyticsQueryParams) {
  const { data } = await api.get('/admin/analytics/summary', { params });
  return data;
}

export async function getAdminRouteAnalytics(params?: AnalyticsQueryParams) {
  const { data } = await api.get('/admin/analytics/routes', { params });
  return data;
}

export async function getAuditLogs(params?: AuditLogQueryParams) {
  const { data } = await api.get('/admin/audit-logs', { params });
  return data;
}

export async function getBackupRuns(params?: { page?: number; limit?: number }): Promise<PaginatedBackupRuns> {
  const { data } = await api.get<PaginatedBackupRuns>('/admin/backup-runs', { params });
  return data;
}

export async function getSystemHealth(): Promise<SystemHealthMetrics> {
  const { data } = await api.get<SystemHealthMetrics>('/admin/system/health');
  return data;
}

export async function getAdminAnalyticsEvents(params?: AnalyticsQueryParams) {
  const { data } = await api.get('/admin/analytics/events', { params });
  return data;
}

export async function triggerAdminBackupRun(): Promise<BackupRunItem> {
  const { data } = await api.post<BackupRunItem>('/admin/backup-runs/db');
  return data;
}
