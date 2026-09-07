import { HttpError } from '../errors/httpError.js';

const PRIORITIES = new Set(['Sekarang', 'Nanti', 'Someday']);
const STATUSES = new Set(['todo', 'done']);
const RECURRENCE_TYPES = new Set(['daily', 'weekly', 'monthly']);
const ALLOWED_FIELDS = new Set([
  'title',
  'priority',
  'status',
  'due',
  'tags',
  'cat',
  'isRecurring',
  'recurrenceType',
]);

const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
};

export function validateTaskId(req, _res, next) {
  if (!/^\d+$/.test(req.params.id) || req.params.id === '0') {
    return next(new HttpError(400, 'Parameter id harus berupa bilangan bulat positif'));
  }
  return next();
}

export function validateTaskPayload({ partial = false } = {}) {
  return (req, _res, next) => {
    const payload = req.body;
    const errors = [];

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return next(new HttpError(400, 'Body harus berupa object JSON'));
    }

    const unknownFields = Object.keys(payload).filter((key) => !ALLOWED_FIELDS.has(key));
    if (unknownFields.length) {
      errors.push(`Field tidak dikenal: ${unknownFields.join(', ')}`);
    }
    if (partial && Object.keys(payload).length === 0) {
      errors.push('Minimal satu field harus dikirim');
    }
    if (!partial && !('title' in payload)) {
      errors.push('title wajib diisi');
    }
    if ('title' in payload && (typeof payload.title !== 'string' || !payload.title.trim() || payload.title.trim().length > 300)) {
      errors.push('title harus berupa teks 1-300 karakter');
    }
    if ('priority' in payload && !PRIORITIES.has(payload.priority)) {
      errors.push('priority harus Sekarang, Nanti, atau Someday');
    }
    if ('status' in payload && !STATUSES.has(payload.status)) {
      errors.push('status harus todo atau done');
    }
    if ('due' in payload && payload.due !== null && !isDate(payload.due)) {
      errors.push('due harus null atau tanggal berformat YYYY-MM-DD');
    }
    if ('cat' in payload && (typeof payload.cat !== 'string' || payload.cat.length > 100)) {
      errors.push('cat harus berupa teks maksimal 100 karakter');
    }
    if ('tags' in payload && (!Array.isArray(payload.tags) || payload.tags.some((tag) => typeof tag !== 'string' || !tag.trim() || tag.trim().length > 50))) {
      errors.push('tags harus berupa array teks, masing-masing 1-50 karakter');
    }
    if ('isRecurring' in payload && typeof payload.isRecurring !== 'boolean') {
      errors.push('isRecurring harus berupa boolean');
    }
    if ('recurrenceType' in payload && !RECURRENCE_TYPES.has(payload.recurrenceType)) {
      errors.push('recurrenceType harus daily, weekly, atau monthly');
    }
    if (!partial && payload.isRecurring === true && !payload.recurrenceType) {
      errors.push('recurrenceType wajib saat isRecurring bernilai true');
    }

    if (errors.length) {
      return next(new HttpError(422, 'Payload task tidak valid', errors));
    }

    if ('title' in payload) payload.title = payload.title.trim();
    if ('cat' in payload) payload.cat = payload.cat.trim();
    if ('tags' in payload) payload.tags = [...new Set(payload.tags.map((tag) => tag.trim()))];
    return next();
  };
}
