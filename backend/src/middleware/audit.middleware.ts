import { Request, Response, NextFunction } from 'express';
import { recordAuditLog } from '../modules/audit/audit.service';

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const isMutation = ['POST', 'PUT', 'DELETE'].includes(req.method);

  // Hook into the finish event of the response to log successfully processed actions
  res.on('finish', () => {
    // Check again during response finish when req.user is guaranteed to be decoded and populated by auth middleware
    const isAdminRoute = req.originalUrl.startsWith('/api/admin');
    const isAdminUser = req.user?.role === 'admin';

    if (isMutation && (isAdminRoute || isAdminUser) && res.statusCode >= 200 && res.statusCode < 300) {
      const parts = req.originalUrl.split('?')[0].split('/');
      // Detect resource category from path
      const resourceType = parts[2] === 'admin' ? (parts[3] || 'admin') : (parts[2] || 'general');
      const resourceId = parts[2] === 'admin' ? (parts[4] || undefined) : (parts[3] || undefined);
      
      const action = `${resourceType}.${req.method.toLowerCase()}`;
      const adminUserId = req.user?.userId || undefined;
      const summary = `Admin executed ${req.method} on ${resourceType}${resourceId ? ` (ID: ${resourceId})` : ''}`;

      recordAuditLog({
        action,
        resourceType,
        resourceId,
        adminUserId,
        summary,
        metadata: {
          path: req.originalUrl,
          statusCode: res.statusCode,
          body: req.body && !req.originalUrl.includes('login') ? { ...req.body, password: req.body.password ? '***' : undefined } : undefined,
        },
        req,
      });
    }
  });

  next();
}
