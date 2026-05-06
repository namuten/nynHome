import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as mediaService from './media.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 600 * 1024 * 1024 } });

router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE' });
    try {
      const postId = req.body.postId ? parseInt(req.body.postId) : undefined;
      const media = await mediaService.uploadMedia(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        req.file.size,
        postId,
      );
      res.status(201).json(media);
    } catch (err: any) {
      if (err.message === 'UNSUPPORTED_MEDIA_TYPE') return res.status(415).json({ error: 'UNSUPPORTED_MEDIA_TYPE' });
      if (err.message === 'FILE_TOO_LARGE') return res.status(413).json({ error: 'FILE_TOO_LARGE' });
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  },
);

router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await mediaService.listMedia(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20,
  );
  res.json(result);
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await mediaService.deleteMedia(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
