import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ScheduleItem } from '../types/api';

export function useSchedules(month?: string) {
  return useQuery({
    queryKey: ['schedules', { month }],
    queryFn: async () => {
      const response = await api.get<ScheduleItem[]>('/schedules', {
        params: month ? { month } : undefined,
      });
      return response.data;
    },
  });
}
