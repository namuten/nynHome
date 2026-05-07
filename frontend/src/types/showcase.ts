import type { LocaleCode } from './profile';

export type ShowcaseCategory = 'art' | 'music' | 'video' | 'writing' | 'study' | 'project' | 'other';

/**
 * 작품 쇼케이스 아이템 타입 정의
 */
export interface ShowcaseItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: ShowcaseCategory;
  coverMediaId: number | null;
  coverMediaUrl?: string; // 클라이언트 렌더링 편의를 위한 확장 필드
  mediaIds: number[];
  mediaUrls?: string[]; // 클라이언트 렌더링 편의를 위한 확장 필드
  postId: number | null;
  locale: LocaleCode;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseDetail extends ShowcaseItem {
  // 상세 조회 시 추가될 수 있는 필드 정의 (예: 연동된 포스트 정보 등)
  postTitle?: string;
}
