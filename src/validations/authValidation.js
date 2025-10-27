// src/controllers/authController.js

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  res.status(200).json(user);
};

// 🔹 Заглушка для /auth/refresh — щоб сервер не падав.
// Потім додаси: читання cookies, перевірку refreshToken, createSession, setSessionCookies тощо.
export const refreshSession = async (req, res, next) => {
  try {
    // TODO: витягти sessionId і refreshToken з cookies, перевірити, оновити сесію
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};
