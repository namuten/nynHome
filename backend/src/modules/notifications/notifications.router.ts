import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { NotificationsService } from './notifications.service';
import { z } from 'zod';

const router = Router();

const UpdatePreferencesSchema = z.object({
  onNewComment: z.boolean().optional(),
  onNewGuestbook: z.boolean().optional(),
  onReportFlagged: z.boolean().optional(),
  emailDigestFreq: z.enum(['never', 'daily', 'weekly']).optional(),
  emailAddress: z.string().email().nullable().optional(),
});

// 모든 알림 라우트는 로그인 필요 (관리자 또는 일반 유저)
router.use(requireAuth);

/**
 * GET /api/notifications
 * 내 알림 목록 가져오기 (페이지네이션)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isReadQuery = req.query.isRead;
    const isRead = isReadQuery !== undefined ? isReadQuery === 'true' : undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    // 관리자가 아니면 본인 알림만 조회 가능, 관리자는 전체 조회 가능 (userId: null)
    const isAdmin = (req.user as any)?.role === 'admin';
    const userId = isAdmin ? null : (req.user as any)?.id;

    const data = await NotificationsService.getNotifications({
      userId,
      isRead,
      page,
      limit,
    });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * 내가 읽지 않은 알림 개수
 */
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = (req.user as any)?.role === 'admin';
    const userId = isAdmin ? null : (req.user as any)?.id;

    const count = await NotificationsService.getUnreadCount(userId);
    return res.json({ unreadCount: count });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/notifications/read-all
 * 전체 읽음 처리
 */
router.post('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = (req.user as any)?.role === 'admin';
    const userId = isAdmin ? null : (req.user as any)?.id;

    await NotificationsService.markAllAsRead(userId);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * 개별 알림 읽음 처리
 */
router.put('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: '유효하지 않은 알림 ID입니다.' });
    }

    const isAdmin = (req.user as any)?.role === 'admin';
    const userId = isAdmin ? null : (req.user as any)?.id;

    await NotificationsService.markAsRead([id], userId);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/notifications/:id
 * 알림 삭제 (관리자 전용)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'INVALID_ID', message: '유효하지 않은 알림 ID입니다.' });
    }

    await NotificationsService.deleteNotification(id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(404).json({ error: 'NOT_FOUND', message: '알림을 찾을 수 없습니다.' });
  }
});

/**
 * GET /api/notifications/preferences
 * 관리자 알림 수신 설정 조회 (관리자 전용)
 */
router.get('/preferences', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUserId = (req.user as any).id;
    const pref = await NotificationsService.getPreferences(adminUserId);
    return res.json(pref);
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/notifications/preferences
 * 관리자 알림 수신 설정 수정 (관리자 전용)
 */
router.put('/preferences', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUserId = (req.user as any).id;
    const result = UpdatePreferencesSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', details: result.error.issues });
    }

    const pref = await NotificationsService.updatePreferences(adminUserId, result.data);
    return res.json(pref);
  } catch (error) {
    return next(error);
  }
});

export default router;
