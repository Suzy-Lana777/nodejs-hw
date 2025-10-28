import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '', trim: true },
    tag: { type: String, enum: TAGS, default: 'Todo', trim: true },
    // обов'язково за ДЗ:
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

// Текстовий індекс для пошуку
noteSchema.index({ title: 'text', content: 'text' });

export const Note = model('Note', noteSchema);
