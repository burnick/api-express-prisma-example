import express, {Router, Request, Response} from 'express';
import handleError from '@/utils/handleError';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.end(`Welcome to default api route`);
  } catch (e: unknown) {
    handleError({e, res});
  }
});

export default router;
