import { Router } from 'express';
import multer from 'multer';
import { mkdir, unlink, rename } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { fileTypeFromFile } from 'file-type';
import { HttpError } from '../errors/httpError.js';

export function createUploadRouter({ uploadDir, authService }) {
  const router = Router();
  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
  const storage = multer.diskStorage({
    destination(req, _file, callback) {
      const dir = path.join(uploadDir, req.userId);
      mkdir(dir, { recursive: true }).then(() => callback(null, dir), callback);
    },
    filename(_req, _file, callback) { callback(null, uuid() + '.tmp'); },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
    fileFilter(_req, file, callback) {
      callback(allowed.has(file.mimetype) ? null : new HttpError(415, 'Hanya gambar PNG, JPEG, WebP, atau GIF yang diperbolehkan'), allowed.has(file.mimetype));
    },
  });
  router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) throw new HttpError(422, 'Kirim satu gambar melalui field form-data file');
    let filePath = req.file.path;
    try {
      const type = await fileTypeFromFile(filePath).catch(() => undefined);
      if (!type || !allowed.has(type.mime) || type.mime !== req.file.mimetype) throw new HttpError(415, 'Isi file tidak sesuai format gambar');
      const filename = path.basename(req.file.filename, '.tmp') + '.' + type.ext;
      const finalPath = path.join(path.dirname(filePath), filename);
      await rename(filePath, finalPath);
      filePath = finalPath;
      const url = '/uploads/' + filename;
      await authService.setAvatar(req.userId, url);
      res.status(201).json({ message: 'Gambar berhasil diunggah', file: { filename, url, mimetype: type.mime, size: req.file.size } });
    } catch (error) {
      await unlink(filePath).catch(() => {});
      throw error;
    }
  });
  router.get('/uploads/:filename', (req, res, next) => {
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp|gif)$/.test(req.params.filename)) throw new HttpError(404, 'Gambar tidak ditemukan');
    res.set('Cache-Control', 'private, max-age=3600');
    res.sendFile(req.params.filename, { root: path.join(uploadDir, req.userId), dotfiles: 'deny' }, (error) => {
      if (error) next(error.status === 404 ? new HttpError(404, 'Gambar tidak ditemukan') : error);
    });
  });
  return router;
}
