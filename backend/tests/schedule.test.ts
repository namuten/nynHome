import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;

beforeAll(async () => {
  await prisma.schedule.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('POST /api/schedules', () => {
  it('admin이 일정을 생성한다', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '방송', startAt: '2026-05-10T20:00:00Z', endAt: '2026-05-10T22:00:00Z' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('방송');
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app).post('/api/schedules').send({ title: '테스트', startAt: '2026-05-10T20:00:00Z', endAt: '2026-05-10T22:00:00Z' });
    expect(res.status).toBe(401);
  });

  it('endAt이 startAt보다 빠르면 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '일정', startAt: '2026-05-10T22:00:00Z', endAt: '2026-05-10T20:00:00Z' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('올바르지 않은 color hex 형식이면 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '일정', startAt: '2026-05-10T20:00:00Z', endAt: '2026-05-10T22:00:00Z', color: 'invalid-color' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/schedules', () => {
  it('모든 사용자가 일정 목록을 조회할 수 있다', async () => {
    const res = await request(app).get('/api/schedules');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('잘못된 month 형식이면 400을 반환한다', async () => {
    const res = await request(app).get('/api/schedules?month=bad');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('올바른 month 형식이면 200을 반환한다', async () => {
    const res = await request(app).get('/api/schedules?month=2026-05');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/schedules/:id', () => {
  it('admin이 일정을 수정한다', async () => {
    const create = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '원본', startAt: '2026-05-10T20:00:00Z', endAt: '2026-05-10T22:00:00Z' });
    const res = await request(app).put(`/api/schedules/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정됨' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정됨');
  });
});

describe('DELETE /api/schedules/:id', () => {
  it('admin이 일정을 삭제한다', async () => {
    const create = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '지울일정', startAt: '2026-05-10T20:00:00Z', endAt: '2026-05-10T22:00:00Z' });
    const res = await request(app).delete(`/api/schedules/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
