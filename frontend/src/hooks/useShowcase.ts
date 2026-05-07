import { useState, useEffect, useCallback } from 'react';
import { getShowcaseList, getShowcaseDetail } from '../lib/showcaseApi';
import type { LocaleCode } from '../types/profile';
import type { ShowcaseItem } from '../types/showcase';

// 초고급 프리미엄 융합 데모작품 세트 (Fallback 용)
const FALLBACK_SHOWCASE_ITEMS: Record<LocaleCode, ShowcaseItem[]> = {
  ko: [
    {
      id: -1,
      title: '🚀 CrocHub: 통합 모니터링 대시보드',
      slug: 'crochub-dashboard',
      description: '실시간 가상화 배터리 장치(DUT) 수명 검사 및 동적 시스템 슬롯 원격 제어 인터페이스입니다. 하이파이 다크 디자인 테마와 SVG 상태 토글링 칩셋, 그리고 정밀 차트 라이브러리를 결합하여 임베디드 디바이스 텔레메트리 제어 과정을 시각적으로 직관화했습니다.',
      category: 'Full-Stack Web',
      coverMediaId: null,
      mediaIds: null,
      postId: 1,
      locale: 'ko',
      tags: ['React', 'TypeScript', 'Node.js', 'Express', 'TailwindCSS'],
      isFeatured: true,
      isPublished: true,
      publishedAt: '2026-05-01T00:00:00.000Z',
      order: 0,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    },
    {
      id: -2,
      title: '🎮 WebGL 3D 몬스터 연구실',
      slug: 'webgl-monster-lab',
      description: 'Three.js와 쉐이더 프로그램을 활용한 웹 기반 실시간 3D 렌더링 실험 공간입니다. 브라우저 내에서 직접 몬스터 3D 모델의 뼈대 관절(Skeletal Rigging) 애니메이션을 실시간 조작하고 광원 반사, 안개 효과를 동적으로 주입하여 몰입감을 높였습니다.',
      category: '3D Graphics',
      coverMediaId: null,
      mediaIds: null,
      postId: 2,
      locale: 'ko',
      tags: ['Three.js', 'WebGL', 'GLSL', 'Vite', 'Vanilla CSS'],
      isFeatured: true,
      isPublished: true,
      publishedAt: '2026-05-02T00:00:00.000Z',
      order: 1,
      createdAt: '2026-05-02T00:00:00.000Z',
      updatedAt: '2026-05-02T00:00:00.000Z',
    },
    {
      id: -3,
      title: '🤖 Antigravity AI 코딩 코파일럿',
      slug: 'antigravity-ai-assistant',
      description: '고도화된 자연어 처리 언어 모델과 실시간 파일 수정 도구를 결합한 자율 에이전트 시스템입니다. 로컬 디렉터리 구조 분석, 다국어 주석 보존 패치, 컴파일러 에러 추적 및 자동 패키지 복구를 포함하여 이상적인 코딩 경험을 프로그래머에게 실시간 제공합니다.',
      category: 'Artificial Intelligence',
      coverMediaId: null,
      mediaIds: null,
      postId: 3,
      locale: 'ko',
      tags: ['Generative AI', 'Agentic Coding', 'Node.js', 'Jest'],
      isFeatured: false,
      isPublished: true,
      publishedAt: '2026-05-03T00:00:00.000Z',
      order: 2,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
    },
  ],
  en: [
    {
      id: -1,
      title: '🚀 CrocHub: Advanced IoT Dashboard',
      slug: 'crochub-dashboard',
      description: 'Real-time telemetry and management system for high-performance battery Device Under Test (DUT) environments. Features an ultra-premium dark mode interface, responsive layouts, live SVG status indicators, and chart visualizers for seamless hardware debugging.',
      category: 'Full-Stack Web',
      coverMediaId: null,
      mediaIds: null,
      postId: 1,
      locale: 'en',
      tags: ['React', 'TypeScript', 'Node.js', 'Express', 'TailwindCSS'],
      isFeatured: true,
      isPublished: true,
      publishedAt: '2026-05-01T00:00:00.000Z',
      order: 0,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    },
    {
      id: -2,
      title: '🎮 WebGL 3D Creature Lab',
      slug: 'webgl-monster-lab',
      description: 'A WebGL experimental space rendered in real-time using Three.js and custom GLSL shaders. Supports skeletal animations, procedural environmental glows, custom camera tracking, and custom physics simulation directly within standard modern browsers.',
      category: '3D Graphics',
      coverMediaId: null,
      mediaIds: null,
      postId: 2,
      locale: 'en',
      tags: ['Three.js', 'WebGL', 'GLSL', 'Vite', 'Vanilla CSS'],
      isFeatured: true,
      isPublished: true,
      publishedAt: '2026-05-02T00:00:00.000Z',
      order: 1,
      createdAt: '2026-05-02T00:00:00.000Z',
      updatedAt: '2026-05-02T00:00:00.000Z',
    },
    {
      id: -3,
      title: '🤖 Antigravity AI Agent Copilot',
      slug: 'antigravity-ai-assistant',
      description: 'An autonomous agentic AI software engine capable of real-time semantic searching, automated file modifications, and precise error tracking. Tailored to minimize human intervention and elevate continuous integration flows.',
      category: 'Artificial Intelligence',
      coverMediaId: null,
      mediaIds: null,
      postId: 3,
      locale: 'en',
      tags: ['Generative AI', 'Agentic Coding', 'Node.js', 'Jest'],
      isFeatured: false,
      isPublished: true,
      publishedAt: '2026-05-03T00:00:00.000Z',
      order: 2,
      createdAt: '2026-05-03T00:00:00.000Z',
      updatedAt: '2026-05-03T00:00:00.000Z',
    },
  ],
};

export function useShowcaseList(locale: LocaleCode, category?: string) {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShowcaseList({ locale, category });
      if (res.items && res.items.length > 0) {
        setItems(res.items);
      } else {
        // 서버 결과가 비어있을 시 fallback 데이터 바인딩
        setItems(
          FALLBACK_SHOWCASE_ITEMS[locale].filter((item) => !category || item.category === category)
        );
      }
    } catch (err: any) {
      console.warn('Failed to fetch remote showcase items. Using gorgeous local fallbacks.', err);
      setItems(
        FALLBACK_SHOWCASE_ITEMS[locale].filter((item) => !category || item.category === category)
      );
    } finally {
      setLoading(false);
    }
  }, [locale, category]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { items, loading, error, refetch: fetchList };
}

export function useShowcaseDetail(slug: string | undefined, currentLocale: LocaleCode) {
  const [item, setItem] = useState<ShowcaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getShowcaseDetail(slug);
      setItem(res);
    } catch (err: any) {
      console.warn('Could not load online showcase details, checking fallback database.', err);
      const fallback = FALLBACK_SHOWCASE_ITEMS[currentLocale].find((s) => s.slug === slug);
      if (fallback) {
        setItem(fallback);
      } else {
        setError('작품을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug, currentLocale]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { item, loading, error, refetch: fetchDetail };
}
export { FALLBACK_SHOWCASE_ITEMS };
