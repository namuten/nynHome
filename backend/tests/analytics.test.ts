import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { runRollup } from '../src/jobs/analyticsRollup.job';

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.dailyAnalyticsRollup.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.user.deleteMany();

  // Register users & login
  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Privacy-Conscious Analytics Event Tracking Integration Tests', () => {
  it('allows public anonymous POST /api/analytics/events page_view ingestion', async () => {
    const res = await request(app)
      .post('/api/analytics/events')
      .send({
        eventName: 'page_view',
        route: '/portfolio',
        referrer: 'https://google.com',
        locale: 'ko',
        sessionId: 'test-session-xyz',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ACCEPTED');
    expect(res.body).toHaveProperty('eventId');

    // Verify sessionId was hashed for privacy
    const savedEvent = await prisma.analyticsEvent.findFirst({
      where: { eventName: 'page_view', route: '/portfolio' },
    });
    expect(savedEvent).toBeDefined();
    expect(savedEvent!.sessionIdHash).not.toBe('test-session-xyz'); // MUST be hashed
    expect(savedEvent!.sessionIdHash).toHaveLength(64); // SHA-256 hex is 64 chars
  });

  it('rejects invalid routes with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/analytics/events')
      .send({
        eventName: 'page_view',
        route: 'http://malicious.com', // Must start with '/' as internal path
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ROUTE');
  });

  it('GET /api/admin/analytics/summary returns 403 for non-admins', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/summary')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/analytics/summary returns 200 with stats for admins', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPageViews');
    expect(res.body).toHaveProperty('totalUniqueSessions');
    expect(res.body).toHaveProperty('timeline');
    expect(Array.isArray(res.body.timeline)).toBe(true);
  });

  it('correctly aggregates yesterday\'s data via analyticsRollup.job', async () => {
    // Force insert an event with yesterday's timestamp
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(12, 0, 0, 0);

    await prisma.analyticsEvent.create({
      data: {
        eventName: 'page_view',
        route: '/portfolio/resume',
        sessionIdHash: 'hashed-session-xyz',
        createdAt: yesterday,
      },
    });

    // Run the rollup job programmatically
    await runRollup();

    // Verify yesterday's rollup row was created
    const rollupDay = new Date();
    rollupDay.setUTCDate(rollupDay.getUTCDate() - 1);
    rollupDay.setUTCHours(0, 0, 0, 0);

    const rollup = await prisma.dailyAnalyticsRollup.findFirst({
      where: {
        day: rollupDay,
        route: '/portfolio/resume',
        eventName: 'page_view',
      },
    });

    expect(rollup).toBeDefined();
    expect(rollup!.count).toBe(1);
    expect(rollup!.uniqueSessions).toBe(1);
  });
});
