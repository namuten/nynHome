import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let testCommentId1: number;
let testCommentId2: number;
let testPostId: number;

/**
 * 어드민 댓글 제어 API 테스트
 * - 권한 검증 (비인증, 일반 유저, 어드민)
 * - 전체 댓글 페이징 조회 및 필터링 검색 검증
 * - 특정 댓글 숨김 처리(PATCH /hidden) 및 400 에러 처리 검증
 */
beforeAll(async () => {
  // DB 상태 초기화
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
  await prisma.comment.deleteMany();

  // 1. 어드민 등록 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'admin_comment@test.com',
    password: 'pw123',
    nickname: 'CommentAdmin',
  });
  await prisma.user.update({
    where: { email: 'admin_comment@test.com' },
    data: { role: 'admin' },
  });
  adminToken = (
    await request(app).post('/api/auth/login').send({
      email: 'admin_comment@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 2. 일반 유저 등록 및 토큰 발급
  await request(app).post('/api/auth/register').send({
    email: 'user_comment@test.com',
    password: 'pw123',
    nickname: 'CommentUser',
  });
  userToken = (
    await request(app).post('/api/auth/login').send({
      email: 'user_comment@test.com',
      password: 'pw123',
    })
  ).body.token;

  // 3. 테스트용 모의 데이터 생성
  const post = await prisma.post.create({
    data: { title: '테스트용 게시글', body: '게시글 본문', category: 'blog', isPublished: true },
  });
  testPostId = post.id;

  const user = await prisma.user.findFirst({ where: { email: 'user_comment@test.com' } });

  if (user) {
    const c1 = await prisma.comment.create({
      data: {
        postId: post.id,
        userId: user.id,
        body: '첫 번째 테스트 댓글 - 스팸 내용 포함',
        isHidden: false,
      },
    });
    testCommentId1 = c1.id;

    const c2 = await prisma.comment.create({
      data: {
        postId: post.id,
        userId: user.id,
        body: '두 번째 테스트 댓글 - 정상적인 내용',
        isHidden: true,
        reply: '관리자 사전답변',
      },
    });
    testCommentId2 = c2.id;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/admin/comments', () => {
  it('인증 토큰이 없으면 401을 반환한다', async () => {
    const res = await request(app).get('/api/admin/comments');
    expect(res.status).toBe(401);
  });

  it('일반 사용자 권한으로 요청하면 403을 반환한다', async () => {
    const res = await request(app).get('/api/admin/comments')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('어드민 권한으로 요청하면 200과 함께 전체 댓글 목록을 반환한다', async () => {
    const res = await request(app).get('/api/admin/comments')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.data.length).toBe(2);
  });

  it('status 필터가 hidden인 경우 숨겨진 댓글만 반환한다', async () => {
    const res = await request(app).get('/api/admin/comments?status=hidden')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].id).toBe(testCommentId2);
    expect(res.body.data[0].isHidden).toBe(true);
  });

  it('q 검색어로 본문 및 답글 내용을 부분 검색한다', async () => {
    const res = await request(app).get('/api/admin/comments?q=스팸')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].id).toBe(testCommentId1);
  });
});

describe('PATCH /api/admin/comments/:id/hidden', () => {
  it('일반 사용자는 댓글의 숨김 여부를 변경할 수 없다 (403)', async () => {
    const res = await request(app).patch(`/api/admin/comments/${testCommentId1}/hidden`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ isHidden: true });

    expect(res.status).toBe(403);
  });

  it('isHidden 바디 데이터 형식이 올바르지 않으면 400을 반환한다', async () => {
    const res = await request(app).patch(`/api/admin/comments/${testCommentId1}/hidden`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isHidden: 'true' }); // string instead of boolean

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('어드민은 특정 댓글을 숨김 처리할 수 있다 (200)', async () => {
    const res = await request(app).patch(`/api/admin/comments/${testCommentId1}/hidden`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isHidden: true });

    expect(res.status).toBe(200);
    expect(res.body.isHidden).toBe(true);

    // 실제 DB 반영 여부 확인
    const dbComment = await prisma.comment.findUnique({ where: { id: testCommentId1 } });
    expect(dbComment?.isHidden).toBe(true);
  });

  it('존재하지 않는 댓글 ID에 대해 요청하면 404를 반환한다', async () => {
    const res = await request(app).patch('/api/admin/comments/99999/hidden')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isHidden: false });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
