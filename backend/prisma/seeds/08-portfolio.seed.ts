import { PrismaClient } from '@prisma/client';

const SECTIONS = [
  {
    locale: 'ko',
    sectionKey: 'education',
    title: '학력',
    order: 0,
    isVisible: true,
    items: [
      { title: '○○고등학교', subtitle: '재학 중', date: '2026-03 ~ 현재', desc: '예술 동아리 활동, 독서 클럽 소속' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'awards',
    title: '수상 & 인정',
    order: 1,
    isVisible: true,
    items: [
      { title: '교내 미술대회 입선', subtitle: '○○고등학교', date: '2025-11', desc: '디지털 일러스트 부문' },
      { title: '독서 클럽 우수 회원', subtitle: '○○고등학교 독서 클럽', date: '2025-12', desc: '연간 독서량 기준 선정' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'projects',
    title: '프로젝트',
    order: 2,
    isVisible: true,
    items: [
      { title: '크로셰 인형 시리즈', subtitle: 'DIY & 핸드크래프트', date: '2025-09 ~ 현재', desc: '곰돌이·토끼·고양이 등 4종 완성, 직접 도안 개발 중' },
      { title: '음악 커버 EP', subtitle: '피아노 & 기타', date: '2026-01 ~ 현재', desc: 'IU·뉴진스 등 6곡 커버 녹음, 포스트에 공개' },
      { title: 'CrocHub 개인 홈페이지', subtitle: 'Full-Stack Web', date: '2025-12 ~ 현재', desc: 'React + Node.js + MySQL 기반 포트폴리오 + 블로그 사이트' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'activities',
    title: '활동',
    order: 3,
    isVisible: true,
    items: [
      { title: '미술 동아리 (부장)', subtitle: '○○고등학교', date: '2026-03 ~ 현재', desc: '전시 기획 및 디지털 아트 워크숍 진행' },
      { title: '독서 클럽', subtitle: '○○고등학교', date: '2025-09 ~ 현재', desc: '월 1회 모임, 연간 12권 목표' },
      { title: '지역 어린이 미술 봉사', subtitle: '지역 도서관', date: '2025-11', desc: '어린이 대상 드로잉 수업 보조' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'skills',
    title: '스킬',
    order: 4,
    isVisible: true,
    items: [
      { title: 'Procreate', subtitle: '디지털 아트', date: null, desc: '일러스트, 캐릭터 디자인' },
      { title: '기타 & 피아노', subtitle: '음악', date: null, desc: '코드 반주, 커버 연주' },
      { title: '뜨개질 (크로셰)', subtitle: 'DIY', date: null, desc: '인형 도안 독해, 제작' },
      { title: 'Notion', subtitle: '생산성', date: null, desc: '일정 관리, 독서 노트' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'goals',
    title: '목표',
    order: 5,
    isVisible: true,
    body: '예술 관련 전공 진학을 목표로 창작 활동을 꾸준히 이어가고 있어요. 디지털 아트와 음악, 글쓰기를 통해 나만의 세계를 만들어나가는 것이 가장 큰 꿈이에요.',
    items: [
      { title: '예술 계열 대학 진학', subtitle: '장기 목표', date: null, desc: '디자인 또는 미디어아트 전공' },
      { title: '개인 작품집 제작', subtitle: '2026 하반기', date: null, desc: '디지털 & 크래프트 작품 한데 모아 출판' },
    ],
  },
];

export async function seedPortfolio(prisma: PrismaClient): Promise<void> {
  for (const s of SECTIONS) {
    const existing = await prisma.portfolioSection.findFirst({
      where: { locale: s.locale, sectionKey: s.sectionKey },
    });
    if (existing) continue;
    await prisma.portfolioSection.create({ data: s });
  }
  console.log('✅ portfolio sections seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedPortfolio(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
