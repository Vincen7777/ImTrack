import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { v4 as uuid, validate as isUuid } from 'uuid';
import { Op, UniqueConstraintError } from 'sequelize';
import { HttpError } from '../errors/httpError.js';

export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const expires = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
export function publicUser(user) {
  return { id: String(user.user_id), fullname: user.fullname, username: user.username, email: user.email, emailVerified: Boolean(user.email_verified_at), avatarUrl: user.avatar_url || null };
}

export function createAuthService({ User, mailService, jwtSecret }) {
  return {
    async register(payload) {
      const token = uuid();
      let user;
      try {
        user = await User.create({
          fullname: payload.fullname, username: payload.username, email: payload.email,
          password_hash: await bcrypt.hash(payload.password, 12),
          verification_token: hashToken(token), verification_expires_at: expires(),
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) throw new HttpError(409, 'Email atau username sudah terdaftar');
        throw error;
      }
      // Keep the account if delivery fails so resend-verification can recover it.
      let delivery;
      try { delivery = await mailService.sendVerification(user.email, token); }
      catch {
        return { message: 'Akun dibuat, tetapi email gagal dikirim. Gunakan Kirim ulang verifikasi.', user: publicUser(user), emailDelivery: 'failed' };
      }
      return { message: delivery === 'file' ? 'Akun dibuat. Buka email verifikasi di folder server/storage/mail pada komputer server.' : 'Registrasi berhasil. Periksa email untuk verifikasi akun.', user: publicUser(user), emailDelivery: delivery };
    },
    async verifyEmail(token) {
      if (typeof token !== 'string' || !isUuid(token)) throw new HttpError(400, 'Invalid Verification Token');
      // Conditional UPDATE makes token consumption atomic, including concurrent requests.
      const [count] = await User.update({
        email_verified_at: new Date(), verification_token: null, verification_expires_at: null,
      }, { where: { verification_token: hashToken(token), verification_expires_at: { [Op.gt]: new Date() }, email_verified_at: null, is_active: true } });
      if (!count) throw new HttpError(400, 'Invalid Verification Token');
      return { message: 'Email Verified Successfully' };
    },
    async resend(email) {
      const user = await User.findOne({ where: { email, email_verified_at: null, is_active: true } });
      if (user) {
        const token = uuid();
        await user.update({ verification_token: hashToken(token), verification_expires_at: expires() });
        try { await mailService.sendVerification(user.email, token); }
        catch { throw new HttpError(503, 'Email belum dapat dikirim. Silakan coba lagi nanti.'); }
      }
      return { message: 'Jika akun belum diverifikasi, email verifikasi baru telah disiapkan. Periksa inbox atau folder email lokal.' };
    },
    async login({ email, password }) {
      const user = await User.findOne({ where: { email } });
      if (!user || !await bcrypt.compare(password, user.password_hash) || !user.is_active) throw new HttpError(401, 'Email atau password yang dimasukkan salah');
      if (!user.email_verified_at) throw new HttpError(403, 'Verifikasi email terlebih dahulu sebelum masuk');
      const token = jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: String(user.user_id), expiresIn: '1h', issuer: 'imtrack-api', audience: 'imtrack-app' });
      return { message: 'Login berhasil', token, tokenType: 'Bearer', expiresIn: 3600, user: publicUser(user) };
    },
    async getUser(id) {
      const user = await User.findByPk(id);
      if (!user || !user.is_active || !user.email_verified_at) return null;
      return publicUser(user);
    },
    async setAvatar(id, avatarUrl) {
      await User.update({ avatar_url: avatarUrl }, { where: { user_id: id } });
    },
  };
}
