import { Router } from 'express';
import { getMatches, unmatch } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getMatches);
router.delete('/:matchId', unmatch);

export default router;
