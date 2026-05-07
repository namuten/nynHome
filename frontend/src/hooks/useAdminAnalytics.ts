import { useQuery } from '@tanstack/react-query';
import {
  getAdminAnalyticsSummary,
  getAdminRouteAnalytics,
  getAdminAnalyticsEvents,
} from '../lib/operationsApi';
import type { AnalyticsQueryParams } from '../lib/operationsApi';

export function useAdminAnalyticsSummary(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'summary', params],
    queryFn: () => getAdminAnalyticsSummary(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminRouteAnalytics(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'routes', params],
    queryFn: () => getAdminRouteAnalytics(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminAnalyticsEvents(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'events', params],
    queryFn: () => getAdminAnalyticsEvents(params),
    placeholderData: (prev) => prev,
  });
}
export default { useAdminAnalyticsSummary, useAdminRouteAnalytics, useAdminAnalyticsEvents };
