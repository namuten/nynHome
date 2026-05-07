import type { LocaleCode } from './profile';

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
}

export interface ShowcaseListResponse {
  locale: LocaleCode;
  items: ShowcaseItem[];
}
