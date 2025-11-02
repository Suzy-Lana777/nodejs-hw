// src/controllers/authController.js

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

// ДОДАНО по зразку:
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

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

// ---------- Request password reset email ----------
export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // ✅ за вимогами ДЗ — однакове повідомлення
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  // 1. Формуємо шлях до шаблона
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  // 2. Читаємо шаблон
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  // 3. Готуємо шаблон до заповнення
  const template = handlebars.compile(templateSource);
  // 4. Підставляємо дані (імʼя або email як fallback)
  const html = template({
    name: user.username ?? user.email,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  // ✅ Resend: sendMail повертає { data, error }
  const { error } = await sendMail({
    from: process.env.RESEND_FROM || process.env.SMTP_FROM, // гнучко
    to: email,
    subject: 'Reset your password',
    html,
  });

  if (error) {
    // контрольовано піднімаємо HTTP-помилку
    throw createHttpError(
      error.statusCode || 500,
      error.message || 'Failed to send the email, please try again later.',
    );
  }

  // (історичний SMTP-виклик залишаю закоментованим, як у тебе було)
  // try {
  //   await sendEmail({
  //     from: process.env.SMTP_FROM,
  //     to: email,
  //     subject: 'Reset your password',
  //     html, // 5. Передаємо HTML у лист
  //   });
  // } catch {
  //   next(
  //     createHttpError(500, 'Failed to send the email, please try again later.'),
  //   );
  //   return;
  // }

  return res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

// ---------- Reset password ----------
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  // 1. Перевіряємо/декодуємо токен
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    next(createHttpError(401, 'Invalid or expired token'));
    return;
  }

  // 2. Шукаємо користувача
  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    next(createHttpError(404, 'User not found'));
    return;
  }

  // 3. Якщо користувач існує — створюємо новий пароль і оновлюємо користувача
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // 4. Інвалідовуємо всі можливі попередні сесії користувача
  await Session.deleteMany({ userId: user._id });

  // 5. Повертаємо успішну відповідь
  res.status(200).json({
    message: 'Password reset successfully',
  });
};
