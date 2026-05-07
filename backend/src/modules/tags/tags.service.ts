import { prisma } from '../../lib/prisma';

export interface TagWithCount {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
  contentCount: number;
}

export class TagsService {
  /**
   * 전체 태그 목록 조회 (+ 연관 콘텐츠 개수 합산)
   */
  static async getAllTags(): Promise<TagWithCount[]> {
    const tags = await prisma.tag.findMany({
      include: {
        contentTags: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      createdAt: t.createdAt,
      contentCount: t.contentTags.length,
    }));
  }

  /**
   * 태그 상세 조회 및 태그에 딸린 모든 콘텐츠(블로그 포스트, 포트폴리오 쇼케이스 등) 취합
   */
  static async getTagWithContents(slug: string) {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        contentTags: true,
      },
    });

    if (!tag) {
      return null;
    }

    const posts: any[] = [];
    const showcases: any[] = [];

    // 태그가 연결된 각 콘텐츠 ID를 바탕으로 실제 상세 레코드 병렬 추출
    const contentResolvers = tag.contentTags.map(async (ct) => {
      if (ct.contentType === 'post') {
        const post = await prisma.post.findUnique({
          where: { id: ct.contentId },
        });
        if (post) {
          posts.push({
            ...post,
            type: 'post',
          });
        }
      } else if (ct.contentType === 'portfolio_item' || ct.contentType === 'portfolio') {
        const showcase = await prisma.showcaseItem.findUnique({
          where: { id: ct.contentId },
        });
        if (showcase) {
          showcases.push({
            ...showcase,
            type: 'portfolio',
          });
        }
      }
    });

    await Promise.all(contentResolvers);

    return {
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        createdAt: tag.createdAt,
      },
      contents: {
        posts: posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        showcases: showcases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      },
    };
  }

  /**
   * [어드민] 태그 신설
   */
  static async createTag(data: { name: string; slug: string; color?: string }) {
    return prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
        color: data.color || null,
      },
    });
  }

  /**
   * [어드민] 태그 개정
   */
  static async updateTag(id: number, data: { name?: string; slug?: string; color?: string }) {
    return prisma.tag.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        color: data.color,
      },
    });
  }

  /**
   * [어드민] 태그 삭제 (CASCADE로 맵핑 자동 제거)
   */
  static async deleteTag(id: number) {
    return prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * [어드민] 특정 콘텐츠에 태그 바인딩 (중복 방지 방어 코드 내장)
   */
  static async attachTagToContent(contentType: string, contentId: number, tagId: number) {
    // 이미 부착되어 있는지 체크
    const existing = await prisma.contentTag.findUnique({
      where: {
        tagId_contentType_contentId: {
          tagId,
          contentType,
          contentId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.contentTag.create({
      data: {
        tagId,
        contentType,
        contentId,
      },
    });
  }

  /**
   * [어드민] 특정 콘텐츠에서 태그 연결 해제
   */
  static async detachTagFromContent(contentType: string, contentId: number, tagId: number) {
    try {
      return await prisma.contentTag.delete({
        where: {
          tagId_contentType_contentId: {
            tagId,
            contentType,
            contentId,
          },
        },
      });
    } catch (e: any) {
      // 레코드가 없어서 생기는 에러 무시 처리
      if (e.code === 'P2025') {
        return null;
      }
      throw e;
    }
  }
}
export default TagsService;
