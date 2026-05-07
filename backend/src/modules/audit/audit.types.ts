export interface CreateAuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  adminUserId?: number;
  summary: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  resourceType?: string;
}
