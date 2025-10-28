// src/controllers/notesController.js

import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// Отримання всіх нотаток користувача
export const getAllNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      tag,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Number(page) || 1;
    const perPageNum = Number(perPage) || 10;
    const skip = (pageNum - 1) * perPageNum;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // ✅ 1. Формуємо базовий запит лише для нотаток поточного користувача
    const notesQuery = Note.find({ userId: req.user._id });

    // ✅ 2. Фільтрація за тегом
    if (tag) {
      notesQuery.where('tag').equals(tag);
    }

    // ✅ 3. Пошук по тексту
    const hasSearch = typeof search === 'string' && search.trim() !== '';
    if (hasSearch) {
      notesQuery.find({ $text: { $search: search.trim() } });
    }

    // ✅ 4. Сортування
    if (hasSearch) {
      notesQuery
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, [sortBy]: sortDirection });
    } else {
      notesQuery.sort({ [sortBy]: sortDirection });
    }

    // ✅ 5. Пагінація
    notesQuery.skip(skip).limit(perPageNum).lean();

    // ✅ 6. Підрахунок загальної кількості
    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments({ userId: req.user._id }),
      notesQuery,
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPageNum));

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// Отримання однієї нотатки користувача за ID
export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).json(note);
};

// Створення нової нотатки (додаємо userId)
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// Оновлення нотатки користувача
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    // Критерій пошуку по userId
    { _id: noteId, userId: req.user._id },
    req.body,
    { new: true },
  );

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

// Видалення нотатки користувача
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    // Критерій пошуку по userId
    userId: req.user._id,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).send(note);
};
