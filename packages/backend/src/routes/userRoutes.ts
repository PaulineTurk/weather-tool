import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

router.get('/default', (req, res) => userController.getDefaultUser(req, res));
router.patch('/:userId/preferences', (req, res) => userController.updateUserPreferences(req, res));

export default router;
