import { HttpError } from '../errors/httpError.js';

export function userContext(req, _res, next) {
  const rawUserId = req.get('x-user-id') ?? process.env.DEFAULT_USER_ID ?? '1';

  if (!/^\d+$/.test(rawUserId) || rawUserId === '0') {
    return next(new HttpError(400, 'Header x-user-id harus berupa bilangan bulat positif'));
  }

  req.userId = rawUserId;
  return next();
}
