import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let dummyMediaId: number;

/**
 * 쇼케이스 API 테스트
 */
beforeAll(async () => {
  // 테스트 격리: 기존 데이터 클리어
  await prisma.showcaseItem.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();

  // 1. 어드민 유저 및 일반 유저 생성
  await request(app).post('/api/auth/register').send({
    email: 'admin_showcase@test.com',
    password: 'pw123',
    nickname: 'ShowcaseAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_showcase@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_showcase@test.com',
      password: 'pw123',
    })
  ).body.token;

  await request(app).post('/api/auth/register').send({
    email: 'user_showcase@test.com',
    password: 'pw123',
    nickname: 'ShowcaseUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_showcase@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 가상의 미디어 레코드 추가
  const media = await prisma.media.create({
    data: {
      fileUrl: 'https://test-bucket.s3.amazonaws.com/uploads/test.png',
      mimeType: 'image/png',
      fileCategory: 'image',
      fileName: 'test.png',
      fileSize: 1024,
    },
  });
  dummyMediaId = media.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/showcase', () => {
  it('게시된 작품 목록만 조회할 수 있다', async () => {
    // published=false인 비공개 테스트 데이터 생성
    await prisma.showcaseItem.create({
      data: {
        title: '비공개 3D 룸',
        slug: 'private-3d-room',
        category: '3D Graphics',
        locale: 'ko',
        isPublished: false,
      },
    });

    // published=true인 공개 테스트 데이터 생성
    await prisma.showcaseItem.create({
      data: {
        title: '공개 WebGL 포털',
        slug: 'public-webgl-portal',
        category: 'WebGL',
        locale: 'ko',
        isPublished: true,
      },
    });

    const res = await request(app).get('/api/showcase?locale=ko');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].slug).toBe('public-webgl-portal');
  });
});

describe('GET /api/showcase/:slug', () => {
  it('공개된 작품은 슬러그 상세 조회가 성공한다', async () => {
    const res = await request(app).get('/api/showcase/public-webgl-portal');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('공개 WebGL 포털');
  });

  it('비공개된 작품은 상세 조회 시 404를 리턴한다', async () => {
    const res = await request(app).get('/api/showcase/private-3d-room');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/showcase', () => {
  const showcasePayload = {
    title: '나의 리액트 웹쇼',
    slug: 'my-react-show',
    category: 'Full-Stack',
    locale: 'ko',
    isPublished: true,
    isFeatured: true,
    coverMediaId: null,
    mediaIds: [],
    tags: ['React', 'Vite'],
  };

  it('비인증 요청 시 401을 리턴한다', async () => {
    const res = await request(app).post('/api/admin/showcase').send(showcasePayload);
    expect(res.status).toBe(401);
  });

  it('일반 유저 권한으로 요청 시 403을 리턴한다', async () => {
    const res = await request(app)
      .post('/api/admin/showcase')
      .set('Authorization', `Bearer ${userToken}`)
      .send(showcasePayload);
    expect(res.status).toBe(403);
  });

  it('슬러그 형식이 올바르지 않으면 400 에러를 반환한다', async () => {
    const invalidPayload = {
      ...showcasePayload,
      slug: 'My React Show!', // 대문자 및 공백, 특수문자는 패턴 에러 유발
    };

    const res = await request(app)
      .post('/api/admin/showcase')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('실제 존재하지 않는 media ID를 할당하면 400 VALIDATION_ERROR를 반환한다', async () => {
    const invalidMediaPayload = {
      ...showcasePayload,
      coverMediaId: 99999, // 존재하지 않는 미디어 ID
    };

    const res = await request(app)
      .post('/api/admin/showcase')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidMediaPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.details.coverMediaId).toBeDefined();
  });

  it('정상적인 어드민 데이터 전송 시 등록이 성공하고 211를 리턴한다', async () => {
    const validPayload = {
      ...showcasePayload,
      coverMediaId: dummyMediaId,
      mediaIds: [dummyMediaId],
    };

    const res = await request(app)
      .post('/api/admin/showcase')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('my-react-show');
    expect(res.body.coverMediaId).toBe(dummyMediaId);
  });

  it('중복된 슬러그 등록 요청 시 409 Conflict를 리턴한다', async () => {
    const res = await request(app)
      .post('/api/admin/showcase')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: '또 다른 웹쇼',
        slug: 'my-react-show', // 이미 위에서 생성된 슬러그
        category: 'Full-Stack',
        locale: 'ko',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('SLUG_DUPLICATE');
  });
});

describe('PUT /api/admin/showcase/:id', () => {
  let itemId: number;

  beforeEach(async () => {
    await prisma.showcaseItem.deleteMany();
    const item = await prisma.showcaseItem.create({
      data: {
        title: '오리지널 제목',
        slug: 'original-slug',
        category: 'Design',
        locale: 'ko',
      },
    });
    itemId = item.id;
  });

  it('정상 필드 수정 시 200 리턴 및 반영 확인', async () => {
    const res = await request(app)
      .put(`/api/admin/showcase/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정된 대단한 제목' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정된 대단한 제목');
  });

  it('다른 항목이 보유한 중복 슬러그로 변경 시 409 에러를 리턴한다', async () => {
    await prisma.showcaseItem.create({
      data: {
        title: '다른 작품',
        slug: 'other-slug',
        category: 'Art',
        locale: 'ko',
      },
    });

    const res = await request(app)
      .put(`/api/admin/showcase/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'other-slug' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('SLUG_DUPLICATE');
  });
});

describe('PUT /api/admin/showcase/reorder', () => {
  it('일괄 ID 리스트를 전송하여 작품 순서를 재조정할 수 있다', async () => {
    await prisma.showcaseItem.deleteMany();
    const item1 = await prisma.showcaseItem.create({
      data: { title: '쇼케이스 1', slug: 'show-1', category: 'Cat', locale: 'ko', order: 10 },
    });
    const item2 = await prisma.showcaseItem.create({
      data: { title: '쇼케이스 2', slug: 'show-2', category: 'Cat', locale: 'ko', order: 20 },
    });

    const res = await request(app)
      .put('/api/admin/showcase/reorder')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids: [item2.id, item1.id] }); // 순서 변경

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const ordered = await prisma.showcaseItem.findMany({
      orderBy: { order: 'asc' },
    });
    expect(ordered[0].id).toBe(item2.id);
    expect(ordered[0].order).toBe(0);
    expect(ordered[1].id).toBe(item1.id);
    expect(ordered[1].order).toBe(1);
  });
});

describe('DELETE /api/admin/showcase/:id', () => {
  it('존재하는 ID로 삭제 요청 시 204 No Content를 반환하고 완벽하게 삭제된다', async () => {
    const item = await prisma.showcaseItem.create({
      data: { title: '삭제대상', slug: 'delete-target', category: 'Trash', locale: 'ko' },
    });

    const res = await request(app)
      .delete(`/api/admin/showcase/${item.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const check = await prisma.showcaseItem.findUnique({ where: { id: item.id } });
    expect(check).toBeNull();
  });
});
