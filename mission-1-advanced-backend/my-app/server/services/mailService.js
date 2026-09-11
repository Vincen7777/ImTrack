import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

export function createMailTransport(config) {
  if (config.mailMode === 'smtp' && !process.env.SMTP_HOST) throw new Error('SMTP_HOST wajib diisi untuk MAIL_MODE=smtp');
  return config.mailMode === 'smtp'
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}),
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      })
    : nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
}

export function createMailService(config) {
  const transporter = createMailTransport(config);
  return {
    async sendVerification(email, token) {
      const url = new URL('/verify-email', config.frontendUrl);
      url.searchParams.set('token', token);
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || 'ImTrack <no-reply@imtrack.local>', to: email,
        subject: 'Verifikasi akun ImTrack',
        text: 'Selamat datang di ImTrack!\n\nBuka tautan berikut dan klik Verifikasi email:\n' + url.href + '\n\nTautan berlaku 24 jam dan hanya dapat digunakan satu kali.',
      });
      if (config.mailMode === 'file') {
        await mkdir(config.mailDir, { recursive: true });
        await writeFile(path.join(config.mailDir, Date.now() + '-' + uuid() + '.eml'), info.message, { flag: 'wx', mode: 0o600 });
      }
      return config.mailMode;
    },
  };
}
