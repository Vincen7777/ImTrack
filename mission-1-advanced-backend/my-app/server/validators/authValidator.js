import { HttpError } from '../errors/httpError.js';

export function validateAuth(mode) {
  return (req, _res, next) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return next(new HttpError(400, 'Body harus berupa object JSON'));
    const errors = [];
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email tidak valid');
    if (mode !== 'resend' && (typeof body.password !== 'string' || body.password.length < (mode === 'register' ? 8 : 1) || Buffer.byteLength(body.password) > 72)) errors.push('Password harus 8-72 byte (minimal 8 karakter saat registrasi)');
    if (mode === 'register') {
      if (typeof body.fullname !== 'string' || !body.fullname.trim() || body.fullname.trim().length > 100) errors.push('fullname harus 1-100 karakter');
      if (typeof body.username !== 'string' || !/^[a-zA-Z0-9_]{3,50}$/.test(body.username)) errors.push('username harus 3-50 huruf, angka, atau underscore');
    }
    if (errors.length) return next(new HttpError(422, 'Data akun tidak valid', errors));
    req.body = { email, ...(mode !== 'resend' ? { password: body.password } : {}), ...(mode === 'register' ? { fullname: body.fullname.trim(), username: body.username.toLowerCase() } : {}) };
    next();
  };
}
