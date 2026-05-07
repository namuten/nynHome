import { useState, useEffect, useCallback } from 'react';
import { getPortfolio } from '../lib/portfolioApi';
import type { LocaleCode } from '../types/profile';
import type { PortfolioSection } from '../types/portfolio';

// API 실패 혹은 데이터베이스가 비었을 때 제공할 고품격 기본값
const getFallbackPortfolio = (locale: LocaleCode): PortfolioSection[] => {
  if (locale === 'ko') {
    return [
      {
        id: -1,
        locale: 'ko',
        sectionKey: 'intro',
        title: '🌟 크리에이티브 개발자 & 3D 테크 아티스트',
        body: '예술과 기술의 경계를 허무는 개발자 홍길동입니다. 웹 프론트엔드 역량과 WebGL/Three.js 그래픽 기법을 융합하여, 화면 위에 풍부한 사용자 스토리와 인터랙션을 생동감 있게 그려냅니다. 문제 해결을 넘어, 사용자의 영혼을 움직이는 예술적인 디지털 경험을 지향합니다.',
        items: [],
        order: 0,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -2,
        locale: 'ko',
        sectionKey: 'education',
        title: '🎓 학업 및 교육 사항',
        body: '이론적 깊이와 실무 감각을 고루 함양한 교육 과정 이력입니다.',
        items: [
          {
            title: '한국대학교 컴퓨터공학과 학사 과정',
            subtitle: '주전공: 소프트웨어 전공',
            date: '2022-03 ~ 2026-02 (예정)',
            description: '소프트웨어 아키텍처, 컴퓨터 그래픽스, 데이터베이스 전공 이수 및 학점 4.1/4.5 우수 졸업 학점 유지.',
          },
        ],
        order: 1,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -3,
        locale: 'ko',
        sectionKey: 'projects',
        title: '💻 핵심 개발 및 드로잉 프로젝트',
        body: '최근 완료하였거나 중점적으로 기여하고 있는 시각 프로젝트입니다.',
        items: [
          {
            title: 'nyHome - 다국어 개인 브랜딩 플랫폼 구축',
            subtitle: 'Full-Stack Developer (Solo Project)',
            date: '2026-04 ~ 2026-05',
            description: 'React, TypeScript, Express 및 MySQL, Prisma 환경 위에 세련된 글래스모피즘 어드민 콘솔과 시각 효과를 지닌 다국어 포트폴리오를 완전 자동화하여 구축했습니다.',
            link: 'https://github.com',
          },
          {
            title: 'Three.js 3D 실시간 인테리어 캔버스 설계',
            subtitle: 'WebGL Graphics Developer',
            date: '2025-10 ~ 2025-12',
            description: '브라우저 단에서 실시간 광원 계산 및 쉐이더 인터랙션을 최적화하여 프레임 레이트 60fps를 고정한 인터랙티브 룸 쇼케이스 웹앱을 배포했습니다.',
          },
        ],
        order: 2,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -4,
        locale: 'ko',
        sectionKey: 'skills',
        title: '⚡ 핵심 보유 역량',
        body: '다음 기술 스택을 바탕으로 신뢰성 높은 결과물을 제작합니다.',
        items: [
          {
            title: 'Frontend & UI Frameworks',
            description: 'React, Next.js, TypeScript, TailwindCSS, CSS Modules, Responsive Design UX',
          },
          {
            title: 'Backend & Database',
            description: 'Node.js, Express, NestJS, Prisma, MySQL, PostgreSQL, Docker Rest API',
          },
          {
            title: 'WebGL & Graphics Suite',
            description: 'Three.js, WebGL, Custom GLSL Shaders, Blender, Spline, SVG Micro-animations',
          },
        ],
        order: 3,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
    ];
  } else {
    return [
      {
        id: -1,
        locale: 'en',
        sectionKey: 'intro',
        title: '🌟 Creative Developer & 3D Tech Artist',
        body: "I am Hong Gildong, a developer blurring the lines between art and technology. Fusing modern frontend stacks with WebGL/Three.js techniques, I breathe life into vibrant user stories on the web canvas. I don't just solve problems; I strive to engineer poetic digital experiences.",
        items: [],
        order: 0,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -2,
        locale: 'en',
        sectionKey: 'education',
        title: '🎓 Education',
        body: 'My academic roadmap combining computational theory and interactive design.',
        items: [
          {
            title: 'Hankuk University, B.S. in Computer Science',
            subtitle: 'Major in Software Engineering',
            date: 'Mar 2022 - Feb 2026 (Expected)',
            description: 'Specialized in Software Architecture, Computer Graphics, and Database. Maintained a GPA of 4.1/4.5.',
          },
        ],
        order: 1,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -3,
        locale: 'en',
        sectionKey: 'projects',
        title: '💻 Signature Projects',
        body: 'Featured creative developments and visually compelling platforms.',
        items: [
          {
            title: 'nyHome - Personal Branding Platform',
            subtitle: 'Full-Stack Developer (Solo Project)',
            date: 'Apr 2026 - May 2026',
            description: 'Developed a multilingual creative showcase platform featuring rich interactive admin panels using React, TypeScript, Express, and Prisma.',
            link: 'https://github.com',
          },
        ],
        order: 2,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: -4,
        locale: 'en',
        sectionKey: 'skills',
        title: '⚡ Skills & Expertises',
        body: 'Technical pillars I utilize to build pixel-perfect scalable architectures.',
        items: [
          {
            title: 'Frontend & UI Frameworks',
            description: 'React, Next.js, TypeScript, TailwindCSS, CSS Modules, Responsive Design UX',
          },
          {
            title: 'Backend & Database',
            description: 'Node.js, Express, NestJS, Prisma, MySQL, PostgreSQL, Docker Rest API',
          },
        ],
        order: 3,
        isVisible: true,
        updatedAt: new Date().toISOString(),
      },
    ];
  }
};

export function usePortfolio(initialLocale: LocaleCode = 'ko') {
  const [locale, setLocale] = useState<LocaleCode>(initialLocale);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async (targetLocale: LocaleCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPortfolio(targetLocale);
      // DB가 비어있거나 가시적인 섹션이 없을 경우 가공된 Fallback 적용
      const visibleSections = data.sections ? data.sections.filter((s) => s.isVisible) : [];
      if (visibleSections.length === 0) {
        setSections(getFallbackPortfolio(targetLocale));
      } else {
        setSections(visibleSections);
      }
    } catch (err: any) {
      console.warn(`Portfolio API fetch failed for locale ${targetLocale}. Loading fallback defaults.`, err);
      setSections(getFallbackPortfolio(targetLocale));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio(locale);
  }, [locale, fetchPortfolio]);

  const changeLocale = (newLocale: LocaleCode) => {
    setLocale(newLocale);
  };

  const refetch = () => {
    fetchPortfolio(locale);
  };

  return {
    locale,
    sections,
    loading,
    error,
    changeLocale,
    refetch,
  };
}
