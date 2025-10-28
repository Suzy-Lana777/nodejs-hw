// src/models/session.js

import { model, Schema } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // посилання на користувача
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
    timestamps: true,
    versionKey: false,
  },
);

export const Session = model('Session', sessionSchema);
