// src/controllers/authController.js

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

// ---------- Register ----------
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createHttpError(400, 'Email in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    const newSession = await createSession(newUser._id);
    setSessionCookies(res, newSession);

    res.status(201).json(newUser); // пароль прибере toJSON
  } catch (err) {
    next(err);
  }
};

// ---------- Login ----------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    // видалити попередню сесію користувача (якщо є)
    await Session.deleteOne({ userId: user._id });

    // створити нову сесію та встановити кукі
    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    res.status(200).json(user); // пароль прибере toJSON
  } catch (err) {
    next(err);
  }
};

// ---------- Refresh session ----------
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    // 1) знайти поточну сесію
    const session = await Session.findOne({
      _id: sessionId,
      refreshToken,
    });

    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    // 2) перевірити термін дії refresh токена
    const isExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isExpired) {
      return next(createHttpError(401, 'Session token expired'));
    }

    // 3) видалити стару сесію
    await Session.deleteOne({ _id: session._id, refreshToken });

    // 4) створити нову сесію та встановити нові кукі
    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

// ---------- Logout ----------
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
