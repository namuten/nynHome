import { SearchService } from '../src/modules/search/search.service';
import { prisma } from '../src/lib/prisma';

describe('Search Integration Tests', () => {
  let tempPostId: number;
  let tempShowcaseId: number;

  beforeAll(async () => {
    // 테스트용 DB에 로컬 FULLTEXT 인덱스가 안 잡혀 있는 예외를 사전에 방어
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE posts ADD FULLTEXT INDEX posts_title_body_idx (title, body) WITH PARSER ngram;`);
    } catch (e) {
      // 이미 인덱스가 잡혀 있으면 성공적인 패스
    }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE showcase_items ADD FULLTEXT INDEX showcase_items_title_description_idx (title, description) WITH PARSER ngram;`);
    } catch (e) {
      // 이미 인덱스가 잡혀 있으면 성공적인 패스
    }

    // 1. 임시 CJK 포스트 레코드 작성
    const post = await prisma.post.create({
      data: {
        title: '신비로운 크로코다일 포스트 제목',
        body: '이 본문에는 크로코다일 가죽과 악어에 대한 신비한 정보들이 빼곡하게 적혀 있습니다.',
        category: 'blog',
      }
    });
    tempPostId = post.id;

    // 2. 임시 CJK 쇼케이스 레코드 작성
    const showcase = await prisma.showcaseItem.create({
      data: {
        title: '포트폴리오 크로코 프로젝트',
        slug: 'cjk-search-test-showcase-unique',
        description: '크로코다일 전용 최고급 가죽 가공 및 웹 대시보드 시스템 구축 아키텍처.',
        category: 'Web App',
        order: 999,
      }
    });
    tempShowcaseId = showcase.id;
  });

  afterAll(async () => {
    // 테스트용 목(Mock) 데이터 완전 소멸 처리
    if (tempPostId) {
      await prisma.post.delete({ where: { id: tempPostId } });
    }
    if (tempShowcaseId) {
      await prisma.showcaseItem.delete({ where: { id: tempShowcaseId } });
    }
    await prisma.$disconnect();
  });

  it('should retrieve matching results containing CJK keyword "크로코"', async () => {
    const res = await SearchService.search({
      query: '크로코',
      types: ['post', 'portfolio'],
      page: 1,
      limit: 10,
    });

    expect(res.query).toBe('크로코');
    expect(res.results.length).toBeGreaterThanOrEqual(2);

    // 반환된 항목들이 올바른 타입을 갖고 있는지 점검
    const types = res.results.map(item => item.type);
    expect(types).toContain('post');
    expect(types).toContain('portfolio');

    // 결과 스코어(Score) 내림차순 정렬 점검
    const scores = res.results.map(item => item.score);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);
  });

  it('should restrict search output to specified types', async () => {
    const res = await SearchService.search({
      query: '크로코',
      types: ['post'], // 오직 블로그 게시글만 지정
      page: 1,
      limit: 10,
    });

    expect(res.results.length).toBeGreaterThanOrEqual(1);
    res.results.forEach(item => {
      expect(item.type).toBe('post');
    });
  });

  it('should output clean empty array when no matches are found', async () => {
    const res = await SearchService.search({
      query: '존재할리없는아주아주기상천외한검색어',
      types: ['post', 'portfolio', 'image', 'video'],
      page: 1,
      limit: 10,
    });

    expect(res.total).toBe(0);
    expect(res.results).toEqual([]);
  });

  it('should return empty results if query is shorter than 2 characters', async () => {
    const res = await SearchService.search({
      query: '크',
      types: ['post', 'portfolio'],
      page: 1,
      limit: 10,
    });

    expect(res.total).toBe(0);
    expect(res.results).toEqual([]);
  });
});
