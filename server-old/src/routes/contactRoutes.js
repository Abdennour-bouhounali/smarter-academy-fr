import express from 'express';
import { handleContactSubmit, handleGetContacts } from '../controllers/contactController.js';
import { validateContact } from '../validators/contactValidator.js';
import { contactRateLimiter } from '../middlewares/rateLimiter.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', contactRateLimiter, validateContact, handleContactSubmit);
router.get('/', requireAuth, requireRole('admin'), handleGetContacts);

export default router;
