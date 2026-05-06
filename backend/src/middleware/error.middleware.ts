import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Global Error Handler]:', err);

  // 1. JWT auth, multer, zod 등 라이브러리 및 커스텀 에러 처리
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '유효하지 않거나 만료된 토큰입니다.',
    });
  }

  // 2. Custom Business Logic Error
  if (err.message === 'NOT_FOUND') {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.',
    });
  }

  if (err.message === 'CANNOT_DELETE_ADMIN') {
    return res.status(403).json({
      error: 'CANNOT_DELETE_ADMIN',
      message: '관리자 계정은 삭제할 수 없습니다.',
    });
  }

  if (err.message === 'POST_NOT_FOUND') {
    return res.status(404).json({
      error: 'POST_NOT_FOUND',
      message: '해당 게시글이 존재하지 않습니다.',
    });
  }

  if (err.message === 'VALIDATION_ERROR') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다.',
    });
  }

  // 3. Fallback
  const status = err.status || 500;
  return res.status(status).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? '서버 내부 에러가 발생했습니다.' : err.message,
  });
}
