import type { User, PostSummary, CommentItem, MediaDerivative } from './api';

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
  derivatives?: MediaDerivative[];
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

// Plan 6 추가 타입들

export interface AdminDashboardMetrics {
  postsTotal: number;
  publishedPosts: number;
  draftPosts: number;
  mediaTotal: number;
  usersTotal: number;
  commentsTotal: number;
  hiddenComments: number;
  schedulesThisMonth: number;
  pushSubscriptions: number;
}

export interface AdminDashboardSummary {
  metrics: AdminDashboardMetrics;
  recentPosts: AdminPostListItem[];
  recentMedia: AdminMediaItem[];
  recentComments: AdminCommentListItem[];
  recentUsers: AdminUserListItem[];
}

export interface AdminCommentListItem {
  id: number;
  postId: number;
  postTitle?: string;
  author?: {
    id: number;
    nickname: string;
    email: string;
  } | null;
  body: string;
  reply?: string | null;
  isHidden: boolean;
  createdAt: string;
}

export interface LayoutSection {
  id?: number;
  sectionKey: string;
  postIds: number[];
  order: number;
  isVisible: boolean;
}

export interface ScheduleItem {
  id: number;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaTypeConfig {
  id: number;
  mimeType: string;
  fileCategory: 'image' | 'video' | 'audio' | 'document' | 'other';
  maxSizeMb: number;
  isAllowed: boolean;
  updatedAt?: string;
}

export interface PushSendRequest {
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  targetType: 'all' | 'user';
  targetUserId?: number;
}

export interface PushCampaign {
  id: number;
  title: string;
  body: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  targetType: string;
  targetUserId?: number | null;
  totalCount: number;
  successCount: number;
  failCount: number;
  sentAt: string;
  createdBy: number;
  createdAt: string;
}

export interface PushCampaignHistoryResponse {
  campaigns: PushCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface PushCampaignStatsResponse {
  totalCampaigns: number;
  totalSent: number;
  totalSuccess: number;
  totalFail: number;
}

export interface AuditLog {
  id: number;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  adminUserId?: number | null;
  summary: string;
  metadata?: any;
  ipHash?: string | null;
  userAgentSummary?: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}


