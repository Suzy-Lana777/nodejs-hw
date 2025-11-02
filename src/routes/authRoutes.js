import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const router = Router();

// 1. Реєстрація користувача
router.post('/auth/register', celebrate(registerUserSchema), registerUser);

// 2. Логін користувача
router.post('/auth/login', celebrate(loginUserSchema), loginUser);

// 3. Вихід користувача
router.post('/auth/logout', logoutUser);

// 4. Оновлення сесії користувача
router.post('/auth/refresh', refreshUserSession);

// 5. Запит на скидання пароля (надсилання email)
router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

// 6. Скидання пароля (встановлення нового)
router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  resetPassword,
);

export default router;
