import api from './api';

export interface Notification {
  id: number;
  userId: number | null;
  type: string; // 'new_comment' | 'new_guestbook' | 'report_resolved' | 'broadcast'
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface GetNotificationsResponse {
  items: Notification[];
  total: number;
}

export interface NotificationPreference {
  id: number;
  adminUserId: number;
  onNewComment: boolean;
  onNewGuestbook: boolean;
  onReportFlagged: boolean;
  emailDigestFreq: 'never' | 'daily' | 'weekly';
  emailAddress: string | null;
  updatedAt: string;
}

export const notificationsApi = {
  /**
   * 알림 목록 조회 (페이징)
   */
  getNotifications: async (page = 1, limit = 10, isRead?: boolean): Promise<GetNotificationsResponse> => {
    const params: any = { page, limit };
    if (isRead !== undefined) {
      params.isRead = isRead;
    }
    const response = await api.get<GetNotificationsResponse>('/notifications', { params });
    return response.data;
  },

  /**
   * 읽지 않은 알림 카운트 조회
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data.unreadCount;
  },

  /**
   * 모든 알림 읽음 처리
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },

  /**
   * 단일 알림 읽음 처리
   */
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  /**
   * 단일 알림 삭제 (관리자용)
   */
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  /**
   * 관리자 알림 수신 설정 조회
   */
  getPreferences: async (): Promise<NotificationPreference> => {
    const response = await api.get<NotificationPreference>('/notifications/preferences');
    return response.data;
  },

  /**
   * 관리자 알림 수신 설정 수정
   */
  updatePreferences: async (data: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    const response = await api.put<NotificationPreference>('/notifications/preferences', data);
    return response.data;
  },
};
export default notificationsApi;
