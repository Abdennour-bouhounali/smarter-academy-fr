import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { validateLogin } from '../validators/authValidator.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', authRateLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
