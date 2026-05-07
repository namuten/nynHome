/**
 * 프로필/브랜딩 설정 타입 정의
 */

export type LocaleCode = 'ko' | 'en';

export interface ProfileSettings {
  id: number;
  locale: LocaleCode;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  school: string | null;
  location: string | null;
  emailPublic: string | null;
  socialLinks: Record<string, string>; // { instagram?: string; youtube?: string; github?: string; blog?: string; etc?: string; }
  interests: string[];
  skills: string[];
  achievements: AchievementItem[];
  updatedAt: string;
}

export interface AchievementItem {
  title: string;
  description?: string;
  date?: string;
}
