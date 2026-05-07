import { prisma } from '../../lib/prisma';

export interface SearchResultItem {
  type: 'post' | 'image' | 'video' | 'portfolio';
  id: number;
  title: string;
  excerpt: string;
  score: number;
  url: string;
  thumbnailUrl: string | null;
  createdAt: Date;
}

export interface SearchResult {
  query: string;
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
}

export class SearchService {
  /**
   * CJK 통합 전문 검색 엔진
   */
  static async search(params: {
    query: string;
    types: ('post' | 'image' | 'video' | 'portfolio')[];
    page: number;
    limit: number;
  }): Promise<SearchResult> {
    const { query, types, page, limit } = params;

    if (!query || query.trim().length < 2) {
      return { query, results: [], total: 0, page, limit };
    }

    const searchPromises: Promise<SearchResultItem[]>[] = [];

    // 1. 블로그 게시물 검색 (MySQL FULLTEXT match against)
    if (types.includes('post')) {
      searchPromises.push(
        (async () => {
          // Prisma Raw Query를 동원해 MATCH AGAINST 스코어를 긁어옵니다.
          const rawPosts = await prisma.$queryRaw<any[]>`
            SELECT 
              id, 
              title, 
              body, 
              createdAt,
              MATCH(title, body) AGAINST(${query} IN NATURAL LANGUAGE MODE) AS score
            FROM posts
            WHERE MATCH(title, body) AGAINST(${query} IN NATURAL LANGUAGE MODE) > 0
          `;

          return rawPosts.map((p) => ({
            type: 'post',
            id: p.id,
            title: p.title,
            excerpt: p.body ? p.body.substring(0, 150) : '',
            score: Number(p.score || 1),
            url: `/post/${p.id}`,
            thumbnailUrl: null,
            createdAt: new Date(p.createdAt),
          }));
        })()
      );
    }

    // 2. 포트폴리오 쇼케이스 아이템 검색 (MySQL FULLTEXT match against)
    if (types.includes('portfolio')) {
      searchPromises.push(
        (async () => {
          const rawShowcases = await prisma.$queryRaw<any[]>`
            SELECT 
              id, 
              title, 
              description, 
              slug,
              createdAt,
              MATCH(title, description) AGAINST(${query} IN NATURAL LANGUAGE MODE) AS score
            FROM showcase_items
            WHERE MATCH(title, description) AGAINST(${query} IN NATURAL LANGUAGE MODE) > 0
          `;

          return rawShowcases.map((s) => ({
            type: 'portfolio',
            id: s.id,
            title: s.title,
            excerpt: s.description ? s.description.substring(0, 150) : '',
            score: Number(s.score || 1),
            url: `/portfolio/showcase/${s.slug}`,
            thumbnailUrl: null,
            createdAt: new Date(s.createdAt),
          }));
        })()
      );
    }

    // 3. 이미지 미디어 검색 (LIKE 패턴 검색 fallback)
    if (types.includes('image')) {
      searchPromises.push(
        (async () => {
          const images = await prisma.media.findMany({
            where: {
              fileCategory: 'image',
              fileName: {
                contains: query,
              },
            },
            take: 100, // 오버플로우 방지 캡핑
          });

          return images.map((img) => ({
            type: 'image',
            id: img.id,
            title: img.fileName,
            excerpt: `MimeType: ${img.mimeType}, Width: ${img.width || 'N/A'}, Height: ${img.height || 'N/A'}`,
            score: 1.0, // LIKE 조인 기본 스코어 부여
            url: img.fileUrl,
            thumbnailUrl: img.fileUrl,
            createdAt: img.createdAt,
          }));
        })()
      );
    }

    // 4. 동영상 미디어 검색 (LIKE 패턴 검색 fallback)
    if (types.includes('video')) {
      searchPromises.push(
        (async () => {
          const videos = await prisma.media.findMany({
            where: {
              fileCategory: 'video',
              fileName: {
                contains: query,
              },
            },
            take: 100,
          });

          return videos.map((vid) => ({
            type: 'video',
            id: vid.id,
            title: vid.fileName,
            excerpt: `MimeType: ${vid.mimeType}, Duration: ${vid.duration ? `${vid.duration}초` : 'N/A'}`,
            score: 1.0,
            url: vid.fileUrl,
            thumbnailUrl: null, // 동영상은 전용 썸네일 경로가 없는 한 null 반환
            createdAt: vid.createdAt,
          }));
        })()
      );
    }

    // 모든 검색 소스를 병렬 실행
    const promiseResults = await Promise.all(searchPromises);
    const mergedResults = promiseResults.flat();

    // 스코어(내림차순), 생성일(내림차순) 정렬 진행
    mergedResults.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const total = mergedResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = mergedResults.slice(startIndex, startIndex + limit);

    return {
      query,
      results: paginatedResults,
      total,
      page,
      limit,
    };
  }
}
export default SearchService;
