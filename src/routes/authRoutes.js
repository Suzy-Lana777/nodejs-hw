// src/routes/authRoutes.js

import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../controllers/authController.js';
import {
  loginUserSchema,
  registerUserSchema,
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

export default router;
