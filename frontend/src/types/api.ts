export interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type PostCategory = 'creative' | 'blog' | 'study';

export interface PostSummary {
  id: number;
  title: string;
  category: PostCategory;
  createdAt: string;
  viewCount: number;
  commentCount?: number;
  thumbnailUrl?: string | null;
  tags?: { id: number; name: string; color: string | null; slug: string }[];
}

export interface PostDetail {
  id: number;
  title: string;
  body: string;
  category: PostCategory;
  createdAt: string;
  viewCount: number;
  media?: MediaItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MediaDerivative {
  id: number;
  mediaId: number;
  derivativeType: 'thumb_small' | 'thumb_medium' | 'web_optimized';
  fileUrl: string;
  width?: number | null;
  height?: number | null;
  mimeType: string;
  fileSize: number | string;
  createdAt: string;
}

export interface MediaItem {
  id: number;
  url: string;
  type: string;
  filename: string;
  derivatives?: MediaDerivative[];
}

export interface CommentItem {
  id: number;
  body: string;
  nickname: string;
  isAdminReply: boolean;
  createdAt: string;
  parentId?: number | null;
  replies?: CommentItem[];
}

export interface ScheduleItem {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  color?: string;
  description?: string;
}

export interface LayoutSection {
  id: number;
  sectionKey: string;
  title: string;
  postIds: number[];
  posts?: PostSummary[];
}

export interface ApiError {
  code: string;
  message?: string;
}
