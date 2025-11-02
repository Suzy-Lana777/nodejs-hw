// src/services/auth.js

import crypto from 'crypto';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';
import { Session } from '../models/session.js';

export const createSession = async (userId) => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// ✅ встановлення куків для авторизації
export const setSessionCookies = (res, session) => {
  const isProd = process.env.NODE_ENV === 'production'; // визначаємо середовище

  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    secure: isProd, // у dev (localhost) буде false, у проді — true
    sameSite: isProd ? 'none' : 'lax', // lax дозволяє куки на localhost
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: ONE_DAY,
  });
};
