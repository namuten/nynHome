import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let commentId: number;
let reportId: number;
let adminId: number;

beforeAll(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.commentReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
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

  // Create user
  await request(app).post('/api/auth/register').send({
    email: 'user@test.com',
    password: 'password123',
    nickname: 'User',
  });

  const userRes = await request(app).post('/api/auth/login').send({
    email: 'user@test.com',
    password: 'password123',
  });
  userToken = userRes.body.token;

  const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });

  // Create a post
  const post = await prisma.post.create({
    data: {
      title: 'Test Post',
      body: 'Content',
      category: 'blog',
      isPublished: true,
    },
  });

  // Create a comment
  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      userId: user!.id,
      body: 'This is an offensive comment.',
    },
  });
  commentId = comment.id;

  // Create a report
  const report = await prisma.commentReport.create({
    data: {
      commentId,
      reporterUserId: user!.id,
      reason: 'spam',
      description: 'spammy content',
      status: 'open',
    },
  });
  reportId = report.id;
});

afterAll(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.commentReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Moderation Integration Tests', () => {
  it('should reject reports GET request if not admin', async () => {
    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.status).toBe(403);
  });

  it('should fetch reports queue if admin', async () => {
    const res = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items[0].id).toBe(reportId);
  });

  it('should update report status as admin', async () => {
    const res = await request(app)
      .patch(`/api/admin/reports/comment/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'resolved',
        resolutionNote: 'Handled',
      });
      
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
    expect(res.body.resolutionNote).toBe('Handled');
    expect(res.body.resolvedByAdminId).toBe(adminId);

    // Verify audit log creation
    const logs = await prisma.auditLog.findMany({
      where: { action: 'report.resolve' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].resourceId).toBe(reportId.toString());
  });

  it('should get moderation queue', async () => {
    const res = await request(app)
      .get('/api/admin/moderation/queue')
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should moderate a comment directly', async () => {
    const res = await request(app)
      .patch(`/api/admin/comments/${commentId}/moderation`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isHidden: true,
        hiddenReason: 'spam',
      });
      
    expect(res.status).toBe(200);
    expect(res.body.isHidden).toBe(true);
    expect(res.body.hiddenReason).toBe('spam');
    expect(res.body.moderatedByAdminId).toBe(adminId);

    // Verify audit log creation
    const logs = await prisma.auditLog.findMany({
      where: { action: 'comment.moderate' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].resourceId).toBe(commentId.toString());
  });
});
