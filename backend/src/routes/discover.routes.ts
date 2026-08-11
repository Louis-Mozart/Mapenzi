import { Router } from 'express';
import { getDiscoverProfiles, swipe } from '../controllers/discover.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getDiscoverProfiles);
router.post('/swipe', swipe);

export default router;
