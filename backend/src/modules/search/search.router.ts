import { Router, Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';

const router = Router();

/**
 * GET /api/search
 * 통합 CJK 전문 검색 API
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string || '';
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    // 쉼표로 분할하여 타입 배열 확보, 비어있을 시 디폴트 전체 검색
    const typesParam = req.query.types as string;
    let types: ('post' | 'image' | 'video' | 'portfolio')[] = ['post', 'image', 'video', 'portfolio'];

    if (typesParam) {
      const parsedTypes = typesParam
        .split(',')
        .map((t) => t.trim())
        .filter((t) => ['post', 'image', 'video', 'portfolio'].includes(t)) as ('post' | 'image' | 'video' | 'portfolio')[];
      
      if (parsedTypes.length > 0) {
        types = parsedTypes;
      }
    }

    const data = await SearchService.search({
      query: q,
      types,
      page,
      limit,
    });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

export default router;
