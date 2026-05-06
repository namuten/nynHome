import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

/**
 * 어드민 대시보드 API 테스트
 * - 권한 테스트 (비인증 401, 일반 유저 403, 어드민 200)
 * - 데이터 조회 형식 및 대시보드 메트릭 검증
 */
beforeAll(async () => {
  // 테스트 격리를 위해 관련 데이터를 초기화합니다.
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.schedule.deleteMany();

  // 1. 어드민 유저 회원가입 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'admin_dashboard@test.com',
    password: 'pw123',
    nickname: 'DashboardAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_dashboard@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_dashboard@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 일반 유저 회원가입 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'user_dashboard@test.com',
    password: 'pw123',
    nickname: 'DashboardUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_dashboard@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 3. 테스트용 모의 데이터 생성
  // 게시글 2개 생성 (1개 공개, 1개 비공개)
  await prisma.post.createMany({
    data: [
      { title: '공개 게시물', body: '본문 1', category: 'blog', isPublished: true },
      { title: '임시 저장물', body: '본문 2', category: 'creative', isPublished: false },
    ],
  });

  const post = await prisma.post.findFirst({ where: { isPublished: true } });
  const testUser = await prisma.user.findFirst({ where: { email: 'user_dashboard@test.com' } });

  if (post && testUser) {
    // 댓글 1개 생성
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: testUser.id,
        body: '댓글 1',
      },
    });
  }

  // 이번 달 일정을 추가
  const now = new Date();
  await prisma.schedule.create({
    data: {
      title: '이번달 일정',
      startAt: new Date(now.getFullYear(), now.getMonth(), 15),
      endAt: new Date(now.getFullYear(), now.getMonth(), 16),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/admin/dashboard', () => {
  it('토큰 없이 요청하면 401을 반환한다', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('일반 유저 권한으로 요청하면 403을 반환한다', async () => {
    const res = await request(app).get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('어드민 권한으로 요청하면 200을 반환하고 요약 메트릭과 최근 등록 리스트들을 응답한다', async () => {
    const res = await request(app).get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('metrics');
    expect(res.body).toHaveProperty('recentPosts');
    expect(res.body).toHaveProperty('recentMedia');
    expect(res.body).toHaveProperty('recentComments');
    expect(res.body).toHaveProperty('recentUsers');

    const metrics = res.body.metrics;
    expect(metrics.postsTotal).toBe(2);
    expect(metrics.publishedPosts).toBe(1);
    expect(metrics.draftPosts).toBe(1);
    expect(metrics.commentsTotal).toBe(1);
    expect(metrics.schedulesThisMonth).toBe(1);
    expect(metrics.usersTotal).toBe(2); // admin, user

    expect(res.body.recentPosts.length).toBeLessThanOrEqual(5);
    expect(res.body.recentComments.length).toBeLessThanOrEqual(5);
    expect(res.body.recentUsers.length).toBeLessThanOrEqual(5);
  });
});
