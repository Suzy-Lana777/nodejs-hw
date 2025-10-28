// src/middlewares/authenticate.js

import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1 Перевіряємо наявність accessToken у cookies
    if (!req.cookies.accessToken) {
      return next(createHttpError(401, 'Missing access token'));
    }

    // 2️ Якщо токен є — шукаємо сесію
    const session = await Session.findOne({
      accessToken: req.cookies.accessToken,
    });

    // 3️ Якщо сесія не знайдена
    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    // 4️ Перевіряємо термін дії токена
    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
      return next(createHttpError(401, 'Access token expired'));
    }

    // 5️ Шукаємо користувача, повʼязаного із сесією
    const user = await User.findById(session.userId);

    // 6️ Якщо користувача не знайдено
    if (!user) {
      return next(createHttpError(401));
    }

    // 7️ Якщо все гаразд — додаємо користувача до запиту
    req.user = user;

    // 8️ Переходимо до наступного middleware або контролера
    next();
  } catch (error) {
    next(error);
  }
};
