import type { LocaleCode } from './profile';

/**
 * SEO 및 Open Graph 설정 타입 정의
 */
export interface SeoSettings {
  id: number;
  routeKey: string; // default, home, profile, portfolio, showcase 등
  title: string;
  description: string;
  ogImageUrl: string;
  keywords: string[];
  locale: LocaleCode;
  updatedAt: string;
}
