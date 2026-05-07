import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { hashIp } from '../../lib/ipHash';
import { summarizeUserAgent } from '../../lib/userAgentSummary';
import { CreateAuditLogParams, AuditLogQueryParams } from './audit.types';

export async function recordAuditLog(
  params: Omit<CreateAuditLogParams, 'ipAddress' | 'userAgent'> & { req?: Request }
) {
  const { action, resourceType, resourceId, adminUserId, summary, metadata, req } = params;

  let ipHash: string | null = null;
  let userAgentSummary: string | null = null;

  if (req) {
    // If Express is behind proxy, req.ip is extracted correctly
    ipHash = hashIp(req.ip);
    const ua = req.headers['user-agent'];
    userAgentSummary = summarizeUserAgent(ua);
  }

  try {
    return await prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId: resourceId?.toString(),
        adminUserId,
        summary,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        ipHash,
        userAgentSummary,
      },
    });
  } catch (err) {
    console.error('Failed to save audit log:', err);
  }
}

export async function listAuditLogs(params: AuditLogQueryParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.action) {
    where.action = params.action;
  }
  if (params.resourceType) {
    where.resourceType = params.resourceType;
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
  };
}
