import { TagsService } from '../src/modules/tags/tags.service';
import { prisma } from '../src/lib/prisma';

describe('Tags Integration Tests', () => {
  let createdTagId: number;
  let createdPostId: number;

  beforeAll(async () => {
    // 1. 테스트 포스트 미리 수립
    const post = await prisma.post.create({
      data: {
        title: '태그 테스트용 가공 포스트',
        body: '이곳은 태그 바인딩 테스트 본문 영역입니다.',
        category: 'study',
      },
    });
    createdPostId = post.id;
  });

  afterAll(async () => {
    // 2. 가공 데이터 완전 청소
    if (createdPostId) {
      await prisma.post.delete({ where: { id: createdPostId } }).catch(() => {});
    }
    if (createdTagId) {
      await prisma.tag.delete({ where: { id: createdTagId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('should create and retrieve tags with content counts', async () => {
    // 태그 생성
    const tag = await TagsService.createTag({
      name: '인공지능',
      slug: 'ai-development',
      color: '#8b5cf6',
    });
    createdTagId = tag.id;

    expect(tag.name).toBe('인공지능');
    expect(tag.slug).toBe('ai-development');
    expect(tag.color).toBe('#8b5cf6');

    // 전체 리스트 확인
    const list = await TagsService.getAllTags();
    const myTag = list.find((t) => t.id === createdTagId);
    expect(myTag).toBeDefined();
    expect(myTag?.contentCount).toBe(0); // 콘텐츠 아직 부착 전
  });

  it('should associate a tag to a post and retrieve via slug', async () => {
    // 태그 연결
    await TagsService.attachTagToContent('post', createdPostId, createdTagId);

    // 슬러그 기반 조회
    const data = await TagsService.getTagWithContents('ai-development');
    expect(data).not.toBeNull();
    expect(data?.tag.name).toBe('인공지능');
    
    // 콘텐츠 목록 취합 점검
    expect(data?.contents.posts.length).toBe(1);
    expect(data?.contents.posts[0].id).toBe(createdPostId);

    // 전체 카운트가 1개로 늘어났는지 점검
    const list = await TagsService.getAllTags();
    const myTag = list.find((t) => t.id === createdTagId);
    expect(myTag?.contentCount).toBe(1);
  });

  it('should safely detach a tag from content and trigger CASCADE deletion on tag delete', async () => {
    // 연결 해제
    await TagsService.detachTagFromContent('post', createdPostId, createdTagId);

    const dataAfterDetach = await TagsService.getTagWithContents('ai-development');
    expect(dataAfterDetach?.contents.posts.length).toBe(0);

    // 부모 태그 완전 삭제
    await TagsService.deleteTag(createdTagId);
    createdTagId = 0; // afterAll에서 중복 삭제 시도 방지

    const dataAfterDelete = await TagsService.getTagWithContents('ai-development');
    expect(dataAfterDelete).toBeNull();
  });
});
