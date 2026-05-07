export const i18nDict = {
  ko: {
    // Navigation / Public
    navHome: '홈',
    navGallery: '창작 갤러리',
    navBlog: '테크 블로그',
    navStudy: '학습 아카이브',
    navProfile: '자기소개',
    navPortfolio: '포트폴리오',
    navResume: '이력서',
    navShowcase: '쇼케이스',
    
    // Auth & General
    login: '로그인',
    logout: '로그아웃',
    register: '회원가입',
    back: '이전으로',
    backToWorks: '작품 목록으로 돌아가기',
    viewAll: '전체보기',
    welcome: '반갑습니다, {name}님',
    
    // Project / Fallback notifications
    featuredWork: '⭐ 추천 프로젝트',
    projectIntro: '📋 프로젝트 소개',
    demoAudio: '🎵 프로젝트 동행 오디오 가이드',
    audioGuideSub: '나만의 고품격 개발 해설 가이드 음성 또는 배경 Lo-Fi 음악을 들어보세요.',
    nowAuditioning: '🎧 오디오 설명 가이드 상영 중',
    fallbackMedia: '대표 스크린샷 갤러리',
    viewSource: '소스코드 보기',
    viewLive: '라이브 데모 가기',
    noEnglishContent: '⚠️ 이 항목은 아직 영문 설명글이 제공되지 않아 한국어 원본으로 표기됩니다.',
    noContent: '아직 등록된 작품이 없습니다.',
    categoryFilter: '카테고리 필터',
  },
  en: {
    // Navigation / Public
    navHome: 'Home',
    navGallery: 'Gallery',
    navBlog: 'Blog',
    navStudy: 'Study',
    navProfile: 'Profile',
    navPortfolio: 'Portfolio',
    navResume: 'Resume',
    navShowcase: 'Showcase',
    
    // Auth & General
    login: 'Sign In',
    logout: 'Sign Out',
    register: 'Sign Up',
    back: 'Back',
    backToWorks: 'Back to Works',
    viewAll: 'View All',
    welcome: 'Welcome, {name}',
    
    // Project / Fallback notifications
    featuredWork: '⭐ FEATURED WORK',
    projectIntro: '📋 Project Context',
    demoAudio: '🎵 Project Audio Walkthrough',
    audioGuideSub: 'Listen to the premium developer walk-through audio or ambient background Lo-Fi.',
    nowAuditioning: '🎧 Now Auditioning',
    fallbackMedia: 'Representative Screenshot Gallery',
    viewSource: 'View Repository',
    viewLive: 'Live Sandbox Demo',
    noEnglishContent: '⚠️ This content is shown in Korean because an English translation is not yet available.',
    noContent: 'No items registered yet.',
    categoryFilter: 'Category Filter',
  },
};

export type I18nKeys = keyof typeof i18nDict.ko;
