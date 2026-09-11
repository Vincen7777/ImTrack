import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

export function runtimeConfig() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.startsWith('replace-')) throw new Error('JWT_SECRET wajib diisi minimal 32 karakter acak di .env');
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT tidak valid');
  const mailMode = process.env.MAIL_MODE || 'file';
  if (!['file', 'smtp'].includes(mailMode)) throw new Error('MAIL_MODE harus file atau smtp');
  if (process.env.NODE_ENV === 'production' && mailMode !== 'smtp') throw new Error('Production memerlukan MAIL_MODE=smtp');
  return {
    port, jwtSecret, mailMode,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    uploadDir: path.join(root, 'upload'),
    mailDir: path.join(root, 'server/storage/mail'),
  };
}
