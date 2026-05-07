import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import * as auditService from '../src/modules/audit/audit.service';

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create users & tokens
  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Audit Logs Service and Endpoint Integration Tests', () => {
  it('correctly records an audit log through service layer', async () => {
    const log = await auditService.recordAuditLog({
      action: 'post.create',
      resourceType: 'post',
      resourceId: '42',
      adminUserId: 1,
      summary: '신규 테스트용 블로그 포스트 업로드',
      metadata: { title: '테스트 블로그' },
    });

    expect(log).toBeDefined();
    expect(log!.action).toBe('post.create');
    expect(log!.resourceType).toBe('post');
    expect(log!.resourceId).toBe('42');
    expect(log!.summary).toBe('신규 테스트용 블로그 포스트 업로드');
  });

  it('GET /api/admin/audit-logs returns 401 Unauthorized when unauthenticated', async () => {
    const res = await request(app).get('/api/admin/audit-logs');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/audit-logs returns 403 Forbidden when accessed by non-admin user', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/audit-logs returns 200 with logs when accessed by admin user', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].action).toBe('post.create');
  });
});
