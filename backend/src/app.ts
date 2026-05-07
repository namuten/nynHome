import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { securityHeadersMiddleware } from './middleware/securityHeaders.middleware';
import { globalRateLimiter } from './middleware/rateLimit.middleware';
import { auditMiddleware } from './middleware/audit.middleware';
import authRouter from './modules/auth/auth.router';
import postsRouter from './modules/posts/posts.router';
import mediaRouter from './modules/media/media.router';
import commentsRouter from './modules/comments/comments.router';
import scheduleRouter from './modules/schedule/schedule.router';
import layoutRouter from './modules/layout/layout.router';
import pushRouter from './modules/push/push.router';
import adminRouter from './modules/admin/admin.router';
import profileRouter from './modules/profile/profile.router';
import portfolioRouter from './modules/portfolio/portfolio.router';
import showcaseRouter from './modules/showcase/showcase.router';
import seoRouter from './modules/seo/seo.router';
import auditRouter from './modules/audit/audit.router';
import analyticsRouter from './modules/analytics/analytics.router';
import operationsRouter from './modules/operations/operations.router';
import reportsRouter from './modules/reports/reports.router';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import { generateSitemapXml, generateRobotsTxt } from './modules/seo/sitemap.service';

const app = express();

app.set('trust proxy', 1);

app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(globalRateLimiter);
app.use(auditMiddleware);
app.use(cors());
app.use(express.json());

// Cache policy controls
import { noCacheMiddleware, setCacheHeader } from './lib/cacheHeaders';
app.use('/api', noCacheMiddleware);

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const xml = await generateSitemapXml();
    setCacheHeader(res, 'SITEMAP_ROBOTS');
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (_req, res) => {
  const robots = generateRobotsTxt();
  setCacheHeader(res, 'SITEMAP_ROBOTS');
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

app.get('/api/health', (_req, res) => {
  // Overwrite dynamic API no-store for health probe so proxy load balancers can cache health results if desired
  setCacheHeader(res, 'SITEMAP_ROBOTS');
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/media', mediaRouter);
app.use('/api', commentsRouter);
app.use('/api', reportsRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/layout', layoutRouter);
app.use('/api/push', pushRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', auditRouter);
app.use('/api/admin', operationsRouter);
app.use('/api', analyticsRouter);
app.use('/api', profileRouter);
app.use('/api', portfolioRouter);
app.use('/api', showcaseRouter);
app.use('/api', seoRouter);

app.use(errorMiddleware);

export default app;
