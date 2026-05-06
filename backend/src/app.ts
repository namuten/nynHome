import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './modules/auth/auth.router';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(errorMiddleware);

export default app;
