import type { LocaleCode } from './profile';

export interface ShowcaseMediaItem {
  id: number;
  postId: number | null;
  fileUrl: string;
  mimeType: string;
  fileCategory: 'image' | 'video' | 'audio' | 'document' | 'other';
  fileName: string;
  fileSize: string | number;
  createdAt: string;
}

/**
 * 쇼케이스 작품 아이템 타입 정의
 */
export interface ShowcaseItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  coverMediaId: number | null;
  mediaIds: number[] | null;
  postId: number | null;
  locale: LocaleCode;
  tags: string[] | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  coverMedia?: ShowcaseMediaItem | null;
  galleryMedia?: ShowcaseMediaItem[] | null;
}

export interface ShowcaseListResponse {
  locale: LocaleCode;
  items: ShowcaseItem[];
}
