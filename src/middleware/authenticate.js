// src/middlewares/authenticate.js

import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  // 1. Перевіряємо наявність accessToken у cookies
  if (!req.cookies.accessToken) {
    return next(createHttpError(401, 'Missing access token'));
  }

  // 2. Якщо accessToken є — шукаємо сесію в базі
  const session = await Session.findOne({
    accessToken: req.cookies.accessToken,
  });

  // 3. Якщо сесії немає — повертаємо помилку
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  // 4. Перевіряємо термін дії access токена
  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);

  if (isAccessTokenExpired) {
    return next(createHttpError(401, 'Access token expired'));
  }

  // 5. Якщо токен дійсний — шукаємо користувача
  const user = await User.findById(session.userId);

  // 6. Якщо користувача не знайдено — повертаємо 401 без повідомлення
  if (!user) {
    return next(createHttpError(401));
  }

  // 7. Якщо все добре — додаємо користувача до req.user
  req.user = user;

  // 8. Передаємо управління наступному middleware/контролеру
  next();
};
