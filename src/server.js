// src/server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js'; // ⬅️ додали

const app = express();
const PORT = process.env.PORT ?? 3030;

// core middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(helmet());

// підключаємо маршрути нотаток
app.use(notesRoutes);

// 404 і 500
app.use(notFoundHandler);
app.use(errorHandler);

// підключення до MongoDB і старт
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
