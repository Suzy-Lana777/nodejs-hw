// src/routes/notesRoutes.js
import { Router } from 'express';
import { Note } from '../models/note.js';

const router = Router();

router.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.status(200).json(notes);
});

router.get('/notes/:noteId', async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  res.status(200).json(note);
});

export default router;
