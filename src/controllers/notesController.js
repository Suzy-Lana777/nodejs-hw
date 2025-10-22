// src/controllers/notesController.js
import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

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

    const skip = (page - 1) * perPage;

    const filter = {};
    if (tag) filter.tag = tag;

    const hasSearch = typeof search === 'string' && search.trim() !== '';
    if (hasSearch) {
      filter.$text = { $search: search.trim() };
    }

    let baseQuery = Note.find(filter).lean();

    // Формуємо об’єкт сортування
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    if (hasSearch) {
      baseQuery = baseQuery
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, [sortBy]: sortDirection });
    } else {
      // без текстового пошуку — стандартне сортування
      baseQuery = baseQuery.sort({ [sortBy]: sortDirection });
    }

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      baseQuery.skip(skip).limit(perPage),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalNotes / perPage));

    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId).lean();
    if (!note) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!note) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({ _id: noteId }).lean();
    if (!note) return next(createHttpError(404, 'Note not found'));
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
