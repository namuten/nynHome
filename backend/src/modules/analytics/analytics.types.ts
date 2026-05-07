export interface CreateAnalyticsEventParams {
  eventName: string;
  route: string;
  referrer?: string;
  locale?: string;
  sessionId?: string;
  userId?: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsQueryFilters {
  from?: string; // ISO date string or YYYY-MM-DD
  to?: string; // ISO date string or YYYY-MM-DD
  limit?: number;
  eventName?: string;
}
