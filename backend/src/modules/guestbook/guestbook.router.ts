import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import {
  GuestbookListQuerySchema,
  CreateGuestbookEntrySchema,
  GuestbookReportSchema,
} from './guestbook.types';
import * as guestbookService from './guestbook.service';

const router = Router();

router.get('/', validateQuery(GuestbookListQuerySchema), async (req: Request, res: Response) => {
  try {
    const result = await guestbookService.listEntries(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/', requireAuth, validateBody(CreateGuestbookEntrySchema), async (req: Request, res: Response) => {
  try {
    const result = await guestbookService.createEntry(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'SPAM_DETECTED') {
      return res.status(400).json({ error: 'SPAM_DETECTED', message: '스팸 링크가 너무 많이 감지되었습니다.' });
    }
    if (err.message === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({ error: 'RATE_LIMIT', message: '너무 자주 작성하셨습니다. 잠시 후 다시 시도해 주세요.' });
    }
    if (err.message === 'DUPLICATE_ENTRY') {
      return res.status(429).json({ error: 'DUPLICATE_ENTRY', message: '최근에 동일한 내용을 작성하셨습니다.' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/:id/reports', requireAuth, validateBody(GuestbookReportSchema), async (req: Request, res: Response) => {
  try {
    const result = await guestbookService.reportEntry(
      parseInt(req.params.id),
      req.user!.userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'NOT_FOUND', message: '해당 글이 존재하지 않습니다.' });
    }
    if (err.message === 'CANNOT_REPORT_OWN') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: '본인의 작성 글은 신고할 수 없습니다.' });
    }
    if (err.message === 'ALREADY_REPORTED') {
      return res.status(409).json({ error: 'ALREADY_REPORTED', message: '이미 신고한 방명록 글입니다.' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
