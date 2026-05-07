import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let anotherUserToken: string;
let entryId: number;
let adminId: number;
let userId: number;
let anotherUserId: number;

beforeAll(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.guestbookReport.deleteMany();
  await prisma.guestbookEntry.deleteMany();
  await prisma.user.deleteMany();

  // Create admin
  await request(app).post('/api/auth/register').send({
    email: 'admin@test.com',
    password: 'password123',
    nickname: 'Admin',
  });

  await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: { role: 'admin' },
  });

  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123',
  });
  adminToken = adminRes.body.token;

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  adminId = adminUser!.id;

  // Create user 1
  await request(app).post('/api/auth/register').send({
    email: 'user1@test.com',
    password: 'password123',
    nickname: 'User One',
  });

  const user1Res = await request(app).post('/api/auth/login').send({
    email: 'user1@test.com',
    password: 'password123',
  });
  userToken = user1Res.body.token;

  const user1 = await prisma.user.findUnique({ where: { email: 'user1@test.com' } });
  userId = user1!.id;

  // Create user 2
  await request(app).post('/api/auth/register').send({
    email: 'user2@test.com',
    password: 'password123',
    nickname: 'User Two',
  });

  const user2Res = await request(app).post('/api/auth/login').send({
    email: 'user2@test.com',
    password: 'password123',
  });
  anotherUserToken = user2Res.body.token;

  const user2 = await prisma.user.findUnique({ where: { email: 'user2@test.com' } });
  anotherUserId = user2!.id;
});

afterAll(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.guestbookReport.deleteMany();
  await prisma.guestbookEntry.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Guestbook Integration Tests', () => {
  it('should fetch guestbook entries', async () => {
    const res = await request(app).get('/api/guestbook');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('should reject creating guestbook entry without token', async () => {
    const res = await request(app)
      .post('/api/guestbook')
      .send({ body: 'Hello' });
    expect(res.status).toBe(401);
  });

  it('should reject empty body for guestbook entry', async () => {
    const res = await request(app)
      .post('/api/guestbook')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: '' });
    expect(res.status).toBe(400);
  });

  it('should create guestbook entry as user', async () => {
    const res = await request(app)
      .post('/api/guestbook')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: 'Nice website!' });
    expect(res.status).toBe(201);
    expect(res.body.body).toBe('Nice website!');
    entryId = res.body.id;
  });

  it('should report guestbook entry', async () => {
    const res = await request(app)
      .post(`/api/guestbook/${entryId}/reports`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ reason: 'spam', description: 'This looks like spam' });
    expect(res.status).toBe(201);
  });

  it('should reject duplicate report on guestbook entry', async () => {
    const res = await request(app)
      .post(`/api/guestbook/${entryId}/reports`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ reason: 'spam', description: 'This looks like spam' });
    expect(res.status).toBe(409);
  });

  it('should list reports as admin', async () => {
    const res = await request(app)
      .get('/api/admin/reports?type=guestbook')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0].comment.id).toBe(entryId);
  });

  it('should resolve guestbook report as admin', async () => {
    const reportsRes = await request(app)
      .get('/api/admin/reports?type=guestbook')
      .set('Authorization', `Bearer ${adminToken}`);
    const reportId = reportsRes.body.items[0].id;

    const res = await request(app)
      .patch(`/api/admin/reports/guestbook/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved', resolutionNote: 'Done' });
    expect(res.status).toBe(200);
  });

  it('should moderate guestbook entry (hide)', async () => {
    const res = await request(app)
      .patch(`/api/admin/guestbook/${entryId}/moderation`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isHidden: true, hiddenReason: 'spam' });
    expect(res.status).toBe(200);
    expect(res.body.isHidden).toBe(true);

    // GET /api/guestbook should exclude this hidden entry
    const listRes = await request(app).get('/api/guestbook');
    const items = listRes.body.items;
    const found = items.some((i: any) => i.id === entryId);
    expect(found).toBe(false);

    // Audit log should be generated
    const logs = await prisma.auditLog.findMany({
      where: { action: 'guestbook.moderate' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].resourceId).toBe(entryId.toString());
  });
});
