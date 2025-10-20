// src/server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { errors as celebrateErrors } from 'celebrate';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3030;

// core middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(helmet());

// підключаємо маршрути нотаток
app.use(notesRoutes);

// обробка 404
app.use(notFoundHandler);

// обробка помилок від celebrate (валідація)
app.use(celebrateErrors());

// глобальна обробка інших помилок (500 тощо)
app.use(errorHandler);

// підключення до MongoDB і старт сервера
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
