// src/models/session.js

import { model, Schema } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // обов’язкове посилання на користувача
    },
    accessToken: {
      type: String,
      required: true, // токен доступу
    },
    refreshToken: {
      type: String,
      required: true, // токен для оновлення
    },
    accessTokenValidUntil: {
      type: Date,
      required: true, // дата, до якої дійсний accessToken
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true, // дата, до якої дійсний refreshToken
    },
  },
  {
    timestamps: true, // автоматично створює createdAt і updatedAt
    versionKey: false, // вимикає __v
  },
);

export const Session = model('Session', sessionSchema);
