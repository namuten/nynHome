import { prisma } from '../../lib/prisma';

export interface CollectionWithCount {
  id: number;
  title: string;
  description: string | null;
  coverImageId: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

export class CollectionsService {
  /**
   * 컬렉션 신설
   */
  static async createCollection(data: {
    title: string;
    description?: string;
    coverImageId?: number;
    isPublished?: boolean;
  }) {
    return prisma.collection.create({
      data: {
        title: data.title,
        description: data.description || null,
        coverImageId: data.coverImageId || null,
        isPublished: data.isPublished || false,
      },
    });
  }

  /**
   * 컬렉션 리스트 조회 (+ 수록 아이템 개수 합산)
   */
  static async getCollections(publishedOnly?: boolean): Promise<CollectionWithCount[]> {
    const whereClause = publishedOnly ? { isPublished: true } : {};

    const collections = await prisma.collection.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      coverImageId: c.coverImageId,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      itemCount: c.items.length,
    }));
  }

  /**
   * 컬렉션 개별 상세 조회 (아이템 목록 position 오름차순 포함)
   */
  static async getCollectionById(id: number) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // 각 아이템에 딸린 실시간 콘텐츠 상세 정보 병렬 주입
    const resolvedItems = await Promise.all(
      collection.items.map(async (item) => {
        let details: any = null;

        if (item.contentType === 'post') {
          details = await prisma.post.findUnique({
            where: { id: item.contentId },
          });
        } else if (item.contentType === 'portfolio_item' || item.contentType === 'portfolio') {
          details = await prisma.showcaseItem.findUnique({
            where: { id: item.contentId },
          });
        }

        return {
          id: item.id,
          collectionId: item.collectionId,
          contentType: item.contentType,
          contentId: item.contentId,
          position: item.position,
          details,
        };
      })
    );

    return {
      ...collection,
      items: resolvedItems,
    };
  }

  /**
   * [어드민] 컬렉션 수정
   */
  static async updateCollection(
    id: number,
    data: {
      title?: string;
      description?: string;
      coverImageId?: number;
      isPublished?: boolean;
    }
  ) {
    return prisma.collection.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        coverImageId: data.coverImageId,
        isPublished: data.isPublished,
      },
    });
  }

  /**
   * [어드민] 컬렉션 삭제 (CASCADE 연쇄로 아이템들도 파괴됨)
   */
  static async deleteCollection(id: number) {
    return prisma.collection.delete({
      where: { id },
    });
  }

  /**
   * [어드민] 컬렉션에 아이템 수록 추가
   * - 중복 추가인 경우 예외를 내거나 null을 리턴하여 409 조율 가능하게 함.
   * - position은 자동으로 마지막 순서(max + 1)로 순차 배정.
   */
  static async addItemToCollection(collectionId: number, contentType: string, contentId: number) {
    // 1. 중복 체크
    const existing = await prisma.collectionItem.findUnique({
      where: {
        collectionId_contentType_contentId: {
          collectionId,
          contentType,
          contentId,
        },
      },
    });

    if (existing) {
      return null; // 중복 존재 발견
    }

    // 2. 신규 position 계산을 위해 현재 컬렉션 아이템들의 개수/최대값 확인
    const itemsCount = await prisma.collectionItem.count({
      where: { collectionId },
    });

    return prisma.collectionItem.create({
      data: {
        collectionId,
        contentType,
        contentId,
        position: itemsCount, // 0-indexed로 정밀 배정
      },
    });
  }

  /**
   * [어드민] 컬렉션 아이템 영구 축출
   */
  static async removeItemFromCollection(collectionId: number, itemId: number) {
    return prisma.collectionItem.deleteMany({
      where: {
        id: itemId,
        collectionId,
      },
    });
  }

  /**
   * [어드민] 컬렉션 수록 아이템들의 표시 순서 reordering 배치 처리
   */
  static async reorderItems(
    collectionId: number,
    items: { contentType: string; contentId: number; position: number }[]
  ) {
    const transactions = items.map((it) =>
      prisma.collectionItem.update({
        where: {
          collectionId_contentType_contentId: {
            collectionId,
            contentType: it.contentType,
            contentId: it.contentId,
          },
        },
        data: {
          position: it.position,
        },
      })
    );

    await prisma.$transaction(transactions);
  }

  /**
   * 특정 콘텐츠(포스트, 쇼케이스 등)가 수록된 컬렉션 목록 역조회
   */
  static async getCollectionsByContent(contentType: string, contentId: number) {
    const collectionItems = await prisma.collectionItem.findMany({
      where: {
        contentType,
        contentId,
      },
      include: {
        collection: true,
      },
    });

    return collectionItems.map((ci) => ci.collection);
  }
}
export default CollectionsService;
