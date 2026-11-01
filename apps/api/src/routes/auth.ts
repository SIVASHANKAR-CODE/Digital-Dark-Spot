import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { googleAuth, localLogin, localRegister, getMe } from '../controllers/authController';
import { googleAuthSchema, localLoginSchema, localRegisterSchema } from '../schemas/auth';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Google OAuth 2.0 Identity Services verification endpoint
router.post('/google', validateRequest(googleAuthSchema), googleAuth);

// Standard local auth endpoints
router.post('/login', validateRequest(localLoginSchema), localLogin);
router.post('/register', validateRequest(localRegisterSchema), localRegister);

// Verified current user profile
router.get('/me', requireAuth, getMe);

export default router;
