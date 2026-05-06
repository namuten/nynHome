import type { User, PostSummary, CommentItem } from './api';

export interface AdminPostListItem extends PostSummary {
  isPublished: boolean;
  updatedAt: string;
}

export interface AdminMediaItem {
  id: number;
  postId?: number | null;
  fileUrl: string;
  mimeType: string;
  fileCategory: 'image' | 'video' | 'audio' | 'document' | 'other';
  fileName: string;
  fileSize: string | number;
  createdAt: string;
}

export interface AdminUserListItem extends User {}

export interface AdminCommentItem extends CommentItem {
  reply?: string | null;
  isHidden: boolean;
  postId: number;
  postTitle?: string;
  userId: number;
  userEmail?: string;
}
