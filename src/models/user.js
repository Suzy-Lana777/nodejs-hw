// src/models/note.js

import { Schema, model } from 'mongoose';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    tag: {
      type: String,
      enum: ['work', 'study', 'personal', 'other'],
      default: 'other',
    },
    // 🔹 нове поле, що пов’язує нотатку з користувачем
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Note = model('Note', noteSchema);
