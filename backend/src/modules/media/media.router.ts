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
  (req: Request, res: Response, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'FILE_TOO_LARGE' });
      } else if (err) {
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE' });
    try {
      let postId: number | undefined;
      if (req.body.postId) {
        postId = parseInt(req.body.postId);
        if (isNaN(postId)) return res.status(400).json({ error: 'VALIDATION_ERROR' });
      }
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
      if (err.message === 'VALIDATION_ERROR') return res.status(400).json({ error: 'VALIDATION_ERROR' });
      if (err.message === 'POST_NOT_FOUND') return res.status(404).json({ error: 'POST_NOT_FOUND' });
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
