import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();
const userController = new UserController();

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.patch('/profile', (req, res) => userController.updateProfile(req, res));
router.patch('/change-password', (req, res) => userController.changePassword(req, res));

export default router;