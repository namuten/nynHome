import { useEffect } from 'react';
import { getSeoSettings } from '../lib/seo';
import type { LocaleCode } from '../types/profile';

/**
 * 동적으로 메타 엘리먼트를 찾거나 생성해 주는 헬퍼 함수
 */
const updateOrCreateMetaTag = (selector: string, attributeName: string, attributeValue: string, contentValue: string) => {
  if (!contentValue) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', contentValue);
};

export function useSeoMeta(routeKey: string, locale: LocaleCode = 'ko') {
  useEffect(() => {
    let active = true;

    const loadMeta = async () => {
      try {
        const settings = await getSeoSettings(routeKey, locale);
        if (!active) return;

        // 1. 문서 타이틀 주입
        if (settings.title) {
          document.title = settings.title;
        }

        // 2. 검색 엔진용 디스크립션 주입
        if (settings.description) {
          updateOrCreateMetaTag('meta[name="description"]', 'name', 'description', settings.description);
        }

        // 3. 검색 키워드 주입
        if (settings.keywords && settings.keywords.length > 0) {
          updateOrCreateMetaTag('meta[name="keywords"]', 'name', 'keywords', settings.keywords.join(', '));
        }

        // 4. Open Graph 태그 주입 (카카오톡, 디스코드, 페이스북, 링크드인 등 소셜 미디어 크롤러 대응)
        if (settings.title) {
          updateOrCreateMetaTag('meta[property="og:title"]', 'property', 'og:title', settings.title);
        }
        if (settings.description) {
          updateOrCreateMetaTag('meta[property="og:description"]', 'property', 'og:description', settings.description);
        }
        if (settings.ogImageUrl) {
          updateOrCreateMetaTag('meta[property="og:image"]', 'property', 'og:image', settings.ogImageUrl);
        } else {
          // 기본 커버 이미지로 가볍게 폴백
          updateOrCreateMetaTag('meta[property="og:image"]', 'property', 'og:image', '/assets/default-og.png');
        }
      } catch (err) {
        console.warn('SEO 메타 로드 실패:', err);
      }
    };

    loadMeta();

    return () => {
      active = false;
    };
  }, [routeKey, locale]);
}
export default useSeoMeta;
