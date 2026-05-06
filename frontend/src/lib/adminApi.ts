import { api } from './api';
import type { PaginatedResponse, PostDetail } from '../types/api';
import type { AdminPostListItem, AdminMediaItem, AdminUserListItem } from '../types/admin';

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

  // Comments
  replyToComment: async (id: number, reply: string) => {
    const response = await api.put(`/comments/${id}/reply`, { reply });
    return response.data;
  },

  hideComment: async (id: number) => {
    await api.delete(`/comments/${id}`);
  },
};
