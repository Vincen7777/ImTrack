import multer from 'multer';
import { UniqueConstraintError } from 'sequelize';
import { HttpError } from '../errors/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, 'Route ' + req.method + ' ' + req.path + ' tidak ditemukan'));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) return res.status(400).json({ error: { message: 'Body JSON tidak valid' } });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: { message: 'Body terlalu besar' } });
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 422).json({ error: { message: error.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 5 MB' : 'Kirim satu gambar melalui field file, tanpa field tambahan' } });
  if (error instanceof UniqueConstraintError) return res.status(409).json({ error: { message: 'Data sudah terdaftar' } });
  const status = error instanceof HttpError ? error.status : 500;
  if (status === 500) console.error('Request gagal:', error.name); // Never log SQL parameters, passwords, or tokens.
  return res.status(status).json({ error: { message: status === 500 ? 'Terjadi kesalahan pada server' : error.message, ...(error instanceof HttpError && error.details ? { details: error.details } : {}) } });
}
