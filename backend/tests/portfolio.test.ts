import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

/**
 * 포트폴리오 섹션 API 테스트
 */
beforeAll(async () => {
  // 테스트 격리를 위해 데이터를 초기화합니다.
  await prisma.portfolioSection.deleteMany();
  await prisma.user.deleteMany();

  // 1. 어드민 생성 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'admin_portfolio@test.com',
    password: 'pw123',
    nickname: 'PortfolioAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_portfolio@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_portfolio@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 일반 유저 생성 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'user_portfolio@test.com',
    password: 'pw123',
    nickname: 'PortfolioUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_portfolio@test.com',
      password: 'pw123',
    })
  ).body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/portfolio', () => {
  it('처음 요청 시 비어있는 포트폴리오 리스트를 반환한다', async () => {
    const res = await request(app).get('/api/portfolio?locale=ko');
    expect(res.status).toBe(200);
    expect(res.body.locale).toBe('ko');
    expect(res.body.sections).toEqual([]);
  });
});

describe('POST /api/admin/portfolio/sections', () => {
  const sectionPayload = {
    locale: 'ko',
    sectionKey: 'education',
    title: '학력 사항',
    body: '나의 학력에 대한 설명입니다.',
    items: [
      {
        title: '한국대학교',
        subtitle: '컴퓨터공학과 학사',
        date: '2022-03 ~ 현재',
        desc: '학점 4.0/4.5',
      },
    ],
    order: 1,
    isVisible: true,
  };

  it('인증 토큰이 없으면 401을 반환한다', async () => {
    const res = await request(app).post('/api/admin/portfolio/sections').send(sectionPayload);
    expect(res.status).toBe(401);
  });

  it('일반 유저 권한으로 요청하면 403을 반환한다', async () => {
    const res = await request(app)
      .post('/api/admin/portfolio/sections')
      .set('Authorization', `Bearer ${userToken}`)
      .send(sectionPayload);
    expect(res.status).toBe(403);
  });

  it('올바르지 않은 데이터를 전송하면 400 VALIDATION_ERROR를 반환한다', async () => {
    const invalidPayload = {
      ...sectionPayload,
      locale: 'fr', // 지원하지 않는 프랑스어 locale
    };
    const res = await request(app)
      .post('/api/admin/portfolio/sections')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('어드민 권한으로 요청하면 성공적으로 섹션을 생성하고 201을 반환한다', async () => {
    const res = await request(app)
      .post('/api/admin/portfolio/sections')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sectionPayload);

    expect(res.status).toBe(201);
    expect(res.body.sectionKey).toBe('education');
    expect(res.body.title).toBe('학력 사항');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe('한국대학교');
  });
});

describe('PUT /api/admin/portfolio/sections/:id', () => {
  let sectionId: number;

  beforeEach(async () => {
    await prisma.portfolioSection.deleteMany();
    const section = await prisma.portfolioSection.create({
      data: {
        locale: 'ko',
        sectionKey: 'experience',
        title: '경력 사항',
        order: 1,
        isVisible: true,
      },
    });
    sectionId = section.id;
  });

  it('어드민이 정상 데이터를 제공하면 섹션을 성공적으로 수정하고 200을 반환한다', async () => {
    const updatePayload = {
      title: '수정된 경력 사항',
      body: '새로운 업무 설명',
      order: 2,
    };

    const res = await request(app)
      .put(`/api/admin/portfolio/sections/${sectionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정된 경력 사항');
    expect(res.body.body).toBe('새로운 업무 설명');
    expect(res.body.order).toBe(2);
  });

  it('존재하지 않는 ID의 섹션을 수정하려고 하면 404를 반환한다', async () => {
    const res = await request(app)
      .put('/api/admin/portfolio/sections/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정' });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/admin/portfolio/sections/reorder', () => {
  it('어드민이 ID 배열을 제공하면 순서를 수정하고 200을 반환한다', async () => {
    await prisma.portfolioSection.deleteMany();
    const s1 = await prisma.portfolioSection.create({
      data: { locale: 'ko', sectionKey: 'k1', title: 'T1', order: 5 },
    });
    const s2 = await prisma.portfolioSection.create({
      data: { locale: 'ko', sectionKey: 'k2', title: 'T2', order: 10 },
    });

    const res = await request(app)
      .put('/api/admin/portfolio/sections/reorder')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids: [s2.id, s1.id] }); // s2를 먼저, s1을 나중에 정렬

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const ordered = await prisma.portfolioSection.findMany({
      where: { locale: 'ko' },
      orderBy: { order: 'asc' },
    });

    expect(ordered[0].id).toBe(s2.id);
    expect(ordered[0].order).toBe(0);
    expect(ordered[1].id).toBe(s1.id);
    expect(ordered[1].order).toBe(1);
  });
});

describe('DELETE /api/admin/portfolio/sections/:id', () => {
  it('어드민이 요청하면 섹션을 영구히 삭제하고 244(또는 204 No Content)를 반환한다', async () => {
    const section = await prisma.portfolioSection.create({
      data: { locale: 'ko', sectionKey: 'del', title: '삭제대상' },
    });

    const res = await request(app)
      .delete(`/api/admin/portfolio/sections/${section.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const deleted = await prisma.portfolioSection.findUnique({
      where: { id: section.id },
    });
    expect(deleted).toBeNull();
  });
});
