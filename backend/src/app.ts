import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './modules/auth/auth.router';
import postsRouter from './modules/posts/posts.router';
import mediaRouter from './modules/media/media.router';

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

app.use(errorMiddleware);

export default app;
