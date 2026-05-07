import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

/**
 * 프로필/브랜딩 API 테스트
 */
beforeAll(async () => {
  // 테스트 격리를 위해 관련 데이터를 초기화합니다.
  await prisma.profileSettings.deleteMany();
  await prisma.user.deleteMany();

  // 1. 어드민 유저 생성 및 로그인 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'admin_profile@test.com',
    password: 'pw123',
    nickname: 'ProfileAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_profile@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_profile@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 일반 유저 생성 및 로그인 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'user_profile@test.com',
    password: 'pw123',
    nickname: 'ProfileUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_profile@test.com',
      password: 'pw123',
    })
  ).body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/profile', () => {
  it('데이터가 없을 경우 기본 한국어 프로필을 반환한다', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body.locale).toBe('ko');
    expect(res.body.displayName).toBe('홍길동');
    expect(res.body.school).toBe('한국대학교');
    expect(res.body.skills).toContain('React');
  });

  it('locale=en 쿼리로 요청 시 기본 영어 프로필을 반환한다', async () => {
    const res = await request(app).get('/api/profile?locale=en');
    expect(res.status).toBe(200);
    expect(res.body.locale).toBe('en');
    expect(res.body.displayName).toBe('John Doe');
    expect(res.body.school).toBe('Korea University');
  });
});

describe('PUT /api/admin/profile/:locale', () => {
  const updatePayload = {
    displayName: '개선된 길동',
    tagline: '글로벌 초인류 개발자',
    bio: '안녕하세요! 저는 새로운 도전을 사랑합니다.',
    avatarUrl: 'https://example.com/avatar.png',
    coverImageUrl: 'https://example.com/cover.png',
    school: '세계일류대',
    location: '뉴욕, 미국',
    emailPublic: 'new_gildong@example.com',
    socialLinks: { github: 'https://github.com/new', instagram: 'https://instagram.com/new' },
    interests: ['인공지능', '러닝', '우주'],
    skills: ['Rust', 'Python', 'Docker'],
    achievements: [
      { title: '글로벌 해커톤 대상', description: '생성형 AI 웹앱 부문 1위', date: '2026-04-30' },
    ],
  };

  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).put('/api/admin/profile/ko').send(updatePayload);
    expect(res.status).toBe(401);
  });

  it('일반 유저 권한으로 요청하면 403을 반환한다', async () => {
    const res = await request(app)
      .put('/api/admin/profile/ko')
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatePayload);
    expect(res.status).toBe(403);
  });

  it('잘못된 형식의 데이터를 전송하면 400 VALIDATION_ERROR를 반환한다', async () => {
    const invalidPayload = {
      ...updatePayload,
      avatarUrl: 'not-a-valid-url', // 유효하지 않은 URL 형식
    };
    const res = await request(app)
      .put('/api/admin/profile/ko')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('잘못된 언어 코드로 요청하면 400 VALIDATION_ERROR를 반환한다', async () => {
    const res = await request(app)
      .put('/api/admin/profile/fr') // 지원하지 않는 언어 코드 fr
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);
    expect(res.status).toBe(400);
  });

  it('어드민 권한으로 유효한 요청을 보낼 경우 데이터베이스에 프로필 설정을 생성/수정(upsert)하고 200을 반환한다', async () => {
    const res = await request(app)
      .put('/api/admin/profile/ko')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.locale).toBe('ko');
    expect(res.body.displayName).toBe('개선된 길동');
    expect(res.body.tagline).toBe('글로벌 초인류 개발자');
    expect(res.body.school).toBe('세계일류대');

    // GET 요청으로 데이터베이스 값 정상 획득 검증
    const getRes = await request(app).get('/api/profile?locale=ko');
    expect(getRes.status).toBe(200);
    expect(getRes.body.displayName).toBe('개선된 길동');
    expect(getRes.body.school).toBe('세계일류대');
    expect(getRes.body.skills).toContain('Rust');
  });
});
