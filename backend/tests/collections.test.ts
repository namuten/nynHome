import { CollectionsService } from '../src/modules/collections/collections.service';
import { prisma } from '../src/lib/prisma';

describe('Collections Integration Tests', () => {
  let createdCollectionId: number;
  let tempPostId1: number;
  let tempPostId2: number;

  beforeAll(async () => {
    // 1. 테스트 포스트 레코드 2개 생성
    const post1 = await prisma.post.create({
      data: {
        title: '컬렉션 수록용 첫번째 포스트',
        body: '첫번째 가공 데이터 본문',
        category: 'creative',
      },
    });
    tempPostId1 = post1.id;

    const post2 = await prisma.post.create({
      data: {
        title: '컬렉션 수록용 두번째 포스트',
        body: '두번째 가공 데이터 본문',
        category: 'blog',
      },
    });
    tempPostId2 = post2.id;
  });

  afterAll(async () => {
    // 2. 가공 데이터 완전 소멸 처리
    if (tempPostId1) {
      await prisma.post.delete({ where: { id: tempPostId1 } }).catch(() => {});
    }
    if (tempPostId2) {
      await prisma.post.delete({ where: { id: tempPostId2 } }).catch(() => {});
    }
    if (createdCollectionId) {
      await prisma.collection.delete({ where: { id: createdCollectionId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('should create a collection and add items to it with order positioning', async () => {
    // 컬렉션 생성
    const col = await CollectionsService.createCollection({
      title: '올해의 크로코 가죽 셀렉션',
      description: '어디에서도 본 적 없는 고해상도 악어가죽 아키텍처 테마 모음집',
      isPublished: true,
    });
    createdCollectionId = col.id;

    expect(col.title).toBe('올해의 크로코 가죽 셀렉션');
    expect(col.isPublished).toBe(true);

    // 첫 번째 아이템 수록
    const item1 = await CollectionsService.addItemToCollection(createdCollectionId, 'post', tempPostId1);
    expect(item1).not.toBeNull();
    expect(item1?.position).toBe(0); // 0-indexed 순서 자동 확보

    // 두 번째 아이템 수록
    const item2 = await CollectionsService.addItemToCollection(createdCollectionId, 'post', tempPostId2);
    expect(item2).not.toBeNull();
    expect(item2?.position).toBe(1); // 1번째 순서 자동 배정

    // 전체 리스트 수집 시 카운트가 2개인지 체크
    const list = await CollectionsService.getCollections(true);
    const myCol = list.find((c) => c.id === createdCollectionId);
    expect(myCol).toBeDefined();
    expect(myCol?.itemCount).toBe(2);
  });

  it('should trigger 409 Conflict style duplicate check when re-adding same content', async () => {
    // 동일한 첫 번째 포스트를 한 번 더 추가
    const duplicateItem = await CollectionsService.addItemToCollection(createdCollectionId, 'post', tempPostId1);
    expect(duplicateItem).toBeNull(); // 중복 추가 방어에 의해 null 반환
  });

  it('should reorder items and verify changed positioning order', async () => {
    // 순서 뒤바꾸기 (첫 번째 포스트를 포지션 1, 두 번째 포스트를 포지션 0 으로)
    const reorderData = [
      { contentType: 'post', contentId: tempPostId1, position: 1 },
      { contentType: 'post', contentId: tempPostId2, position: 0 },
    ];

    await CollectionsService.reorderItems(createdCollectionId, reorderData);

    // 컬렉션 재조회하여 정렬 순서 파악
    const detailed = await CollectionsService.getCollectionById(createdCollectionId);
    expect(detailed).not.toBeNull();
    expect(detailed?.items.length).toBe(2);

    // position 0에 두 번째 포스트(tempPostId2)가 위치해 있는지 검증
    expect(detailed?.items[0].contentId).toBe(tempPostId2);
    expect(detailed?.items[0].position).toBe(0);

    // position 1에 첫 번째 포스트(tempPostId1)가 위치해 있는지 검증
    expect(detailed?.items[1].contentId).toBe(tempPostId1);
    expect(detailed?.items[1].position).toBe(1);
  });

  it('should support reverse lookup to find collections containing a specific content', async () => {
    // 첫 번째 포스트가 소속된 컬렉션 리스트 역조회
    const cols = await CollectionsService.getCollectionsByContent('post', tempPostId1);
    expect(cols.length).toBeGreaterThanOrEqual(1);
    
    const matched = cols.find((c) => c.id === createdCollectionId);
    expect(matched).toBeDefined();
    expect(matched?.title).toBe('올해의 크로코 가죽 셀렉션');
  });

  it('should safely cascade delete all associated pivot items upon collection removal', async () => {
    // 컬렉션 영구 삭제
    await CollectionsService.deleteCollection(createdCollectionId);

    // 하위 피벗 테이블에 해당 컬렉션 아이템들이 남아있는지 카운트 확인
    const itemsCount = await prisma.collectionItem.count({
      where: { collectionId: createdCollectionId },
    });
    expect(itemsCount).toBe(0); // CASCADE 완료 증명

    createdCollectionId = 0; // afterAll 중복 제거 방지
  });
});
