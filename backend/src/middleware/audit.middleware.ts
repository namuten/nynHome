import { Request, Response, NextFunction } from 'express';
import { recordAuditLog } from '../modules/audit/audit.service';

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const isMutation = ['POST', 'PUT', 'DELETE'].includes(req.method);
  const isAdminRoute = req.originalUrl.startsWith('/api/admin');

  // Skip audit logging for get requests or non-admin routes
  if (!isMutation || !isAdminRoute) {
    return next();
  }

  // Hook into the finish event of the response to log successfully processed actions
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const parts = req.originalUrl.split('?')[0].split('/');
      // /api/admin/some-resource -> some-resource
      const resourceType = parts[3] || 'admin';
      const resourceId = parts[4] || undefined;
      
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
          // Exclude sensitive credentials if logged
          body: req.body && !req.originalUrl.includes('login') ? { ...req.body, password: req.body.password ? '***' : undefined } : undefined,
        },
        req,
      });
    }
  });

  next();
}
