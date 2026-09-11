import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validateAuth } from '../validators/authValidator.js';

export function createAuthRouter(authService, verifyToken) {
  const router = Router();
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' } } });
  router.get('/me', verifyToken, (req, res) => res.json({ user: req.user }));
  router.use(limiter);
  router.post('/register', validateAuth('register'), async (req, res) => res.status(201).json(await authService.register(req.body)));
  router.post('/login', validateAuth('login'), async (req, res) => res.json(await authService.login(req.body)));
  router.post('/resend-verification', validateAuth('resend'), async (req, res) => res.json(await authService.resend(req.body.email)));
  const verify = async (req, res) => res.json(await authService.verifyEmail(req.method === 'GET' ? req.query.token : req.body?.token));
  router.get(['/verify-email', '/verifikasi-email'], verify);
  router.post(['/verify-email', '/verifikasi-email'], verify);
  return router;
}
