import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const globalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 300, // limit each IP to 300 requests per window
  standardHeaders: 'draft-6', // standard RateLimit headers
  legacyHeaders: false,
  skip: () => isTest, // Bypass rate-limiting during Jest testing to prevent runner false-positives
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // limit each IP to 5 requests per window
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  skip: (req) => {
    // If it is our dedicated rate-limit test, do NOT skip so the test can verify the 429 response!
    if (isTest && req.header('X-Test-Rate-Limit') === 'true') {
      return false;
    }
    return isTest;
  },
  message: {
    error: 'RATE_LIMITED',
    message: '너무 많은 로그인/가입 시도가 감지되었습니다. 잠시 후 다시 시도해주세요.',
  },
});

export const commentsRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // limit each IP to 10 requests per window
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  skip: () => isTest, // Bypass in tests
  message: {
    error: 'RATE_LIMITED',
    message: '댓글 작성이 일시적으로 제한되었습니다. 잠시 후 다시 시도해주세요.',
  },
});

const lastComments = new Map<number, { content: string; timestamp: number }>();

export function commentSpamGuard(req: Request, res: Response, next: NextFunction) {
  // Always bypass spam guard in tests unless we are explicitly testing it
  if (isTest && req.header('X-Test-Spam-Guard') !== 'true') {
    return next();
  }

  const { body } = req.body;
  if (!body || typeof body !== 'string') {
    return next();
  }

  const trimmed = body.trim();

  // 1. URL count cap (max 2 links per comment)
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urlCount = (trimmed.match(urlRegex) || []).length;
  if (urlCount > 2) {
    return res.status(400).json({
      error: 'SPAM_DETECTED',
      message: '댓글에 너무 많은 링크(URL)가 포함되어 있습니다.',
    });
  }

  // 2. Continuous repetition check (e.g. "zzzzzzzz" or "ㅋㅋㅋㅋㅋㅋㅋ")
  if (/(.)\1{9,}/.test(trimmed)) {
    return res.status(400).json({
      error: 'SPAM_DETECTED',
      message: '도배성 반복 문자가 감지되었습니다.',
    });
  }

  // 3. Short-term exact duplicate posts within 15 seconds per user
  const userId = req.user?.userId;
  if (userId) {
    const last = lastComments.get(userId);
    const now = Date.now();
    if (last && last.content === trimmed && now - last.timestamp < 15 * 1000) {
      return res.status(429).json({
        error: 'SPAM_DETECTED',
        message: '잠시 전에 등록한 댓글과 동일한 내용입니다. 잠시 후 다시 작성해주세요.',
      });
    }
    lastComments.set(userId, { content: trimmed, timestamp: now });
  }

  next();
}
