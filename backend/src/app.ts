import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './modules/auth/auth.router';
import postsRouter from './modules/posts/posts.router';
import mediaRouter from './modules/media/media.router';
import commentsRouter from './modules/comments/comments.router';
import scheduleRouter from './modules/schedule/schedule.router';
import layoutRouter from './modules/layout/layout.router';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/media', mediaRouter);
app.use('/api', commentsRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/layout', layoutRouter);

app.use(errorMiddleware);

export default app;
