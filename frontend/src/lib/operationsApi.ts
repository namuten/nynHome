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

export async function getBackupRuns(params?: { page?: number; limit?: number }) {
  const { data } = await api.get('/admin/backup-runs', { params });
  return data;
}

export async function getSystemHealth() {
  const { data } = await api.get('/admin/system/health');
  return data;
}
