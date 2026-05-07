import type { LocaleCode } from './profile';

/**
 * 포트폴리오 섹션 타입 정의
 */

export interface PortfolioSection {
  id: number;
  locale: LocaleCode;
  sectionKey: string; // intro, education, activities, awards, skills, goals 등
  title: string;
  body: string | null;
  items: PortfolioSectionItem[];
  order: number;
  isVisible: boolean;
  updatedAt: string;
}

export interface PortfolioSectionItem {
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  tags?: string[];
}

export interface PortfolioResponse {
  locale: LocaleCode;
  sections: PortfolioSection[];
}
