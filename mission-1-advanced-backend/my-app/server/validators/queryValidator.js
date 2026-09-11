import { HttpError } from '../errors/httpError.js';

export function validateTaskQuery(req, _res, next) {
  const allowed = new Set(['search', 'cat', 'status', 'priority', 'sort', 'order']);
  const query = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (!allowed.has(key) || typeof value !== 'string') return next(new HttpError(422, 'Query parameter tidak valid'));
    query[key] = value.trim();
  }
  const enums = { status: ['todo', 'done'], priority: ['Sekarang', 'Nanti', 'Someday'], sort: ['createdAt', 'title', 'due', 'priority', 'status'], order: ['asc', 'desc'] };
  for (const [key, values] of Object.entries(enums)) {
    if (key in query && !values.includes(query[key])) return next(new HttpError(422, key + ' harus salah satu dari: ' + values.join(', ')));
  }
  if ((query.search?.length || 0) > 300 || (query.cat?.length || 0) > 100) return next(new HttpError(422, 'Query pencarian/kategori terlalu panjang'));
  req.taskQuery = query;
  next();
}
