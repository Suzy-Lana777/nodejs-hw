// src/routes/notesRoutes.js

import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js';

import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

// ✅ middleware аутентифікації
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// ✅ застосовуємо до всіх шляхів, що починаються з /notes
router.use('/notes', authenticate);

// GET /notes?page=&perPage=&tag=&search=
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

// GET /notes/:noteId
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /notes
router.post('/notes', celebrate(createNoteSchema), createNote);

// PATCH /notes/:noteId
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

// DELETE /notes/:noteId
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

export default router;
