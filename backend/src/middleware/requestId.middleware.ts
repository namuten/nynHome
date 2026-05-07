import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if incoming request has an ID, validate it (must be a alphanumeric/hyphen string), or generate one
  const incomingId = req.headers['x-request-id'];
  let requestId = '';

  if (typeof incomingId === 'string' && /^[a-zA-Z0-9-]+$/.test(incomingId)) {
    requestId = incomingId;
  } else {
    requestId = randomUUID();
  }

  // Attach to request context
  req.requestId = requestId;

  // Set the response header
  res.setHeader('X-Request-ID', requestId);

  next();
}
