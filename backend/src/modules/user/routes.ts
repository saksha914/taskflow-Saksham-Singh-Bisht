import { Router } from 'express';
import { userController } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, userController.list);

export default router;
