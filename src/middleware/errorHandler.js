// src/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware:', err.message);

  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    message: isProd
      ? 'Something went wrong. Please try again later.'
      : err.message,
  });
};
