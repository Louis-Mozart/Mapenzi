import { Router } from 'express';
import { getProfile, updateProfile, uploadPhoto, deletePhoto, getInterests } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/interests', getInterests);
router.get('/profile/:id', getProfile);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/photos', uploadPhoto);
router.delete('/photos/:photoId', deletePhoto);

export default router;
