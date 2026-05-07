import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

/**
 * SEO / Open Graph API 통합 테스트
 */
beforeAll(async () => {
  // 테스트 격리를 위해 데이터를 깨끗이 비워 줍니다.
  await prisma.seoSettings.deleteMany();
  await prisma.user.deleteMany();

  // 1. 어드민 테스트 유저 생성 및 세션 토큰 획득
  await request(app).post('/api/auth/register').send({
    email: 'admin_seo@test.com',
    password: 'pw123',
    nickname: 'SeoAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_seo@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_seo@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 일반 테스트 유저 생성 및 세션 토큰 획득
  await request(app).post('/api/auth/register').send({
    email: 'user_seo@test.com',
    password: 'pw123',
    nickname: 'SeoUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_seo@test.com',
      password: 'pw123',
    })
  ).body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/seo (Public SEO Settings API)', () => {
  it('존재하지 않는 routeKey에 대해 하드코딩된 기본 한국어 Fallback 설정을 반환한다', async () => {
    const res = await request(app).get('/api/seo?routeKey=non_existent_page&locale=ko');
    expect(res.status).toBe(200);
    expect(res.body.routeKey).toBe('non_existent_page');
    expect(res.body.locale).toBe('ko');
    expect(res.body.title).toContain('CrocHub');
    expect(res.body.keywords).toContain('크록허브');
  });

  it('존재하지 않는 routeKey에 대해 하드코딩된 기본 영어 Fallback 설정을 반환한다', async () => {
    const res = await request(app).get('/api/seo?routeKey=non_existent_page&locale=en');
    expect(res.status).toBe(200);
    expect(res.body.routeKey).toBe('non_existent_page');
    expect(res.body.locale).toBe('en');
    expect(res.body.title).toContain('Tech Portfolio & Blog');
    expect(res.body.keywords).toContain('WebGL');
  });
});

describe('PUT /api/admin/seo/:routeKey (Admin SEO Setup API)', () => {
  const seoPayload = {
    title: '나만의 멋진 개발 홈피',
    description: '크록허브 포트폴리오 메인 홈',
    ogImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    keywords: ['블로그', 'WebGL', 'React'],
    locale: 'ko',
  };

  it('인증 토큰이 없으면 401을 반환하며 접근이 차단된다', async () => {
    const res = await request(app).put('/api/admin/seo/home').send(seoPayload);
    expect(res.status).toBe(401);
  });

  it('일반 권한의 유저 토큰이면 403을 반환하며 거절된다', async () => {
    const res = await request(app)
      .put('/api/admin/seo/home')
      .set('Authorization', `Bearer ${userToken}`)
      .send(seoPayload);
    expect(res.status).toBe(403);
  });

  it('Zod 정규식 검증 실패 (제목이 너무 길거나 ogImageUrl 형식이 깨진 경우) 400을 반환한다', async () => {
    const invalidPayload = {
      ...seoPayload,
      title: 'a'.repeat(200), // 최대 180글자 상한 초과
      ogImageUrl: 'not-a-valid-url-format',
    };

    const res = await request(app)
      .put('/api/admin/seo/home')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('어드민 권한으로 정상 요청 시 데이터를 성공적으로 저장하고 200과 함께 결과를 반환한다', async () => {
    const res = await request(app)
      .put('/api/admin/seo/home')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(seoPayload);

    expect(res.status).toBe(200);
    expect(res.body.routeKey).toBe('home');
    expect(res.body.locale).toBe('ko');
    expect(res.body.title).toBe('나만의 멋진 개발 홈피');
    expect(res.body.keywords).toEqual(['블로그', 'WebGL', 'React']);
  });

  it('저장된 설정을 다시 GET으로 조회했을 때 데이터베이스 기록을 정확히 로드한다', async () => {
    const res = await request(app).get('/api/seo?routeKey=home&locale=ko');
    expect(res.status).toBe(200);
    expect(res.body.routeKey).toBe('home');
    expect(res.body.locale).toBe('ko');
    expect(res.body.title).toBe('나만의 멋진 개발 홈피');
    expect(res.body.description).toBe('크록허브 포트폴리오 메인 홈');
    expect(res.body.keywords).toEqual(['블로그', 'WebGL', 'React']);
  });

  it('영어(en) 설정이 없으나 영어로 요청 시, 한국어 세팅으로 유연하게 locale cascade fallback 처리된다', async () => {
    const res = await request(app).get('/api/seo?routeKey=home&locale=en');
    expect(res.status).toBe(200);
    // 데이터베이스에 한국어('ko') 세팅만 등록되어 있으므로, 한국어 설정을 로드해 주어야 함
    expect(res.body.routeKey).toBe('home');
    expect(res.body.locale).toBe('ko');
    expect(res.body.title).toBe('나만의 멋진 개발 홈피');
  });
});
