// src/server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { errors as celebrateErrors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // ✅ додано

const app = express();
const PORT = process.env.PORT ?? 3030;

// core middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());

// ✅ підключаємо маршрути
app.use(authRoutes);
app.use(notesRoutes);
app.use(userRoutes);

// обробка 404
app.use(notFoundHandler);

// обробка помилок celebrate (валідація)
app.use(celebrateErrors());

// глобальна обробка інших помилок (500 тощо)
app.use(errorHandler);

// підключення до MongoDB і старт сервера
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
