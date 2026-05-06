import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

// web-push 모킹
jest.mock('../src/lib/webpush', () => ({
  webpush: {
    sendNotification: jest.fn().mockResolvedValue({ statusCode: 201 }),
  },
}));

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.pushSubscription.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

const subDto = { endpoint: 'https://fcm.example.com/sub123', keys: { p256dh: 'key123', auth: 'auth123' } };

describe('POST /api/push/subscribe', () => {
  it('로그인한 사용자가 푸시 구독을 등록한다', async () => {
    const res = await request(app)
      .post('/api/push/subscribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send(subDto);
    expect(res.status).toBe(201);
    expect(res.body.endpoint).toBe(subDto.endpoint);
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app).post('/api/push/subscribe').send(subDto);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/push/send', () => {
  it('admin이 푸시를 전송한다', async () => {
    await request(app).post('/api/push/subscribe')
      .set('Authorization', `Bearer ${userToken}`).send(subDto);

    const res = await request(app)
      .post('/api/push/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '새 글', body: '확인하세요!', url: '/post/1' });
    expect(res.status).toBe(200);
    expect(res.body.sent).toBeGreaterThanOrEqual(1);
  });

  it('일반 user는 403을 받는다', async () => {
    const res = await request(app)
      .post('/api/push/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '글', body: '내용' });
    expect(res.status).toBe(403);
  });
});
