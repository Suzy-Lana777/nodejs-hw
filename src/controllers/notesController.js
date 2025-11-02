// src/controllers/notesController.js
import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes — з фільтрацією, пошуком, пагінацією
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

    // Фільтр тільки для поточного користувача
    const filter = { userId: req.user._id };

    if (tag) {
      filter.tag = tag;
    }

    const hasSearch = typeof search === 'string' && search.trim() !== '';
    if (hasSearch) {
      filter.$text = { $search: search.trim() };
    }

    // Базовий запит
    let notesQuery = Note.find(filter);

    // Якщо є пошук — додаємо score для сортування, інакше — стандартне сортування
    if (hasSearch) {
      notesQuery = notesQuery
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, [sortBy]: sortDirection });
    } else {
      notesQuery = notesQuery.sort({ [sortBy]: sortDirection });
    }

    // Пагінація + lean
    notesQuery = notesQuery.skip(skip).limit(perPageNum).lean();

    // Паралельне отримання даних і підрахунок
    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      notesQuery,
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPageNum));

    // 🔻 Видаляємо поле score з кожної нотатки (якщо воно є)
    const cleanedNotes = notes.map(({ score, ...rest }) => rest);

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages,
      notes: cleanedNotes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /notes/:noteId — отримати одну нотатку
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOne({
      _id: noteId,
      userId: req.user._id,
    }).lean();

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// POST /notes — створити нову нотатку
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

// PATCH /notes/:noteId — оновити свою нотатку
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    ).lean();

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// DELETE /notes/:noteId — видалити свою нотатку
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user._id,
    }).lean();

    if (!note) {
      return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
