import { api } from './api';
import type { PaginatedResponse, PostDetail } from '../types/api';
import type {
  AdminPostListItem,
  AdminMediaItem,
  AdminUserListItem,
  AdminDashboardSummary,
  AdminCommentListItem,
  LayoutSection,
  ScheduleItem,
  MediaTypeConfig,
  PushSendRequest,
} from '../types/admin';

export const adminApi = {
  // Posts
  getAdminPosts: async (params?: { category?: string; page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<AdminPostListItem>>('/posts', {
      params: {
        ...params,
        includeUnpublished: 'true',
      },
    });
    return response.data;
  },

  getAdminPost: async (id: number) => {
    const response = await api.get<PostDetail & { isPublished: boolean; thumbnailUrl?: string | null }>(`/posts/${id}`);
    return response.data;
  },

  createAdminPost: async (payload: {
    title: string;
    body: string;
    category: string;
    thumbnailUrl?: string;
    isPublished?: boolean;
  }) => {
    const response = await api.post<PostDetail>('/posts', payload);
    return response.data;
  },

  updateAdminPost: async (
    id: number,
    payload: {
      title?: string;
      body?: string;
      category?: string;
      thumbnailUrl?: string;
      isPublished?: boolean;
    }
  ) => {
    const response = await api.put<PostDetail>(`/posts/${id}`, payload);
    return response.data;
  },

  deleteAdminPost: async (id: number) => {
    await api.delete(`/posts/${id}`);
  },

  // Media
  getAdminMedia: async () => {
    const response = await api.get<AdminMediaItem[]>('/media');
    return response.data;
  },

  uploadAdminMedia: async (file: File, postId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (postId !== undefined) {
      formData.append('postId', String(postId));
    }
    const response = await api.post<AdminMediaItem>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAdminMedia: async (id: number) => {
    await api.delete(`/media/${id}`);
  },

  // Users
  getAdminUsers: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<PaginatedResponse<AdminUserListItem>>('/admin/users', {
      params,
    });
    return response.data;
  },

  deleteAdminUser: async (id: number) => {
    await api.delete(`/admin/users/${id}`);
  },

  // Dashboard
  getAdminDashboard: async () => {
    const response = await api.get<AdminDashboardSummary>('/admin/dashboard');
    return response.data;
  },

  // Comments
  getAdminComments: async (params?: {
    page?: number;
    limit?: number;
    postId?: number;
    status?: 'visible' | 'hidden' | 'all';
    q?: string;
  }) => {
    const response = await api.get<PaginatedResponse<AdminCommentListItem>>('/admin/comments', {
      params,
    });
    return response.data;
  },

  replyToComment: async (id: number, reply: string) => {
    const response = await api.put(`/comments/${id}/reply`, { reply });
    return response.data;
  },

  setAdminCommentHidden: async (id: number, isHidden: boolean) => {
    const response = await api.patch(`/admin/comments/${id}/hidden`, { isHidden });
    return response.data;
  },

  // Layout
  getAdminLayout: async () => {
    const response = await api.get<LayoutSection[]>('/layout');
    return response.data;
  },

  updateAdminLayout: async (payload: LayoutSection[]) => {
    const response = await api.put<LayoutSection[]>('/layout', payload);
    return response.data;
  },

  // Schedules
  getAdminSchedules: async (month: string) => {
    const response = await api.get<ScheduleItem[]>('/schedules', {
      params: { month },
    });
    return response.data;
  },

  createAdminSchedule: async (payload: Omit<ScheduleItem, 'id'>) => {
    const response = await api.post<ScheduleItem>('/schedules', payload);
    return response.data;
  },

  updateAdminSchedule: async (id: number, payload: Partial<Omit<ScheduleItem, 'id'>>) => {
    const response = await api.put<ScheduleItem>(`/schedules/${id}`, payload);
    return response.data;
  },

  deleteAdminSchedule: async (id: number) => {
    await api.delete(`/schedules/${id}`);
  },

  // Settings / Media Types
  getAdminMediaTypes: async () => {
    const response = await api.get<MediaTypeConfig[]>('/admin/media-types');
    return response.data;
  },

  updateAdminMediaType: async (id: number, payload: { maxSizeMb?: number; isAllowed?: boolean }) => {
    const response = await api.put<MediaTypeConfig>(`/admin/media-types/${id}`, payload);
    return response.data;
  },

  // Push
  sendAdminPush: async (payload: PushSendRequest) => {
    const response = await api.post('/push/send', payload);
    return response.data;
  },
};
