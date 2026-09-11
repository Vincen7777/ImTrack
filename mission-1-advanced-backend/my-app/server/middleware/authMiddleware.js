import jwt from 'jsonwebtoken';
import { HttpError } from '../errors/httpError.js';

export function createAuthMiddleware({ jwtSecret, authService }) {
  return async (req, _res, next) => {
    const header = req.get('authorization') || '';
    if (!/^Bearer \S+$/i.test(header)) throw new HttpError(401, 'Autentikasi gagal. Gunakan Authorization: Bearer <token>');
    let payload;
    try {
      payload = jwt.verify(header.split(' ')[1], jwtSecret, { algorithms: ['HS256'], issuer: 'imtrack-api', audience: 'imtrack-app' });
    } catch {
      throw new HttpError(401, 'Autentikasi gagal. Token tidak valid atau kedaluwarsa');
    }
    if (typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub)) throw new HttpError(401, 'Autentikasi gagal');
    const user = await authService.getUser(payload.sub);
    if (!user) throw new HttpError(401, 'Akun tidak aktif atau belum diverifikasi');
    req.user = user;
    req.userId = user.id;
    next();
  };
}
