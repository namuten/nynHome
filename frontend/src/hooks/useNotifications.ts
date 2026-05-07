import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/notificationsApi';
import type { NotificationPreference } from '../lib/notificationsApi';

/**
 * 알림 목록 훅
 */
export function useNotifications(page: number, limit: number = 10, isRead?: boolean) {
  return useQuery({
    queryKey: ['notifications', 'list', page, limit, isRead],
    queryFn: () => notificationsApi.getNotifications(page, limit, isRead),
    placeholderData: (previousData) => previousData,
    staleTime: 10000, // 10초 캐시 유효
  });
}

/**
 * 읽지 않은 알림 개수 훅
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 15000, // 15초마다 자동 갱신
  });
}

/**
 * 전역 읽음 처리 뮤테이션
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 단일 알림 읽음 처리 뮤테이션
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 단일 알림 삭제 뮤테이션 (관리자용)
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 관리자 알림 수신 설정 훅
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => notificationsApi.getPreferences(),
  });
}

/**
 * 관리자 알림 수신 설정 수정 뮤테이션
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPreference>) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
}
