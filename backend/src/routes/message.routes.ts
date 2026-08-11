import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/:matchId', getMessages);
router.post('/:matchId', sendMessage);

export default router;
