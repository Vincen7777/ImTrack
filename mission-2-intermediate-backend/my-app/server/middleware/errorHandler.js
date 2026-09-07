import { HttpError } from '../errors/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} tidak ditemukan`));
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: { message: 'Body JSON tidak valid' } });
  }

  if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(422).json({
      error: { message: 'User pada x-user-id tidak ditemukan di database' },
    });
  }

  const status = error instanceof HttpError ? error.status : 500;
  const body = {
    error: {
      message: status === 500 ? 'Terjadi kesalahan pada server' : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json(body);
}
