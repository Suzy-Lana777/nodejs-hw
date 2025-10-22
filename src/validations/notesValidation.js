// src/validations/notesValidation.js
import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

// Дозволені поля сортування для нотаток
const SORT_FIELDS = ['_id', 'title', 'tag', 'createdAt', 'updatedAt'];

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'page must be a number',
      'number.min': 'page must be at least {#limit}',
      'number.integer': 'page must be an integer',
    }),
    perPage: Joi.number().integer().min(5).max(20).default(10).messages({
      'number.base': 'perPage must be a number',
      'number.min': 'perPage must be at least {#limit}',
      'number.max': 'perPage must be at most {#limit}',
      'number.integer': 'perPage must be an integer',
    }),
    tag: Joi.string()
      .valid(...TAGS)
      .messages({
        'any.only': `tag must be one of: ${TAGS.join(', ')}`,
        'string.base': 'tag must be a string',
      }),
    search: Joi.string().trim().allow('').messages({
      'string.base': 'search must be a string',
    }),
    // 🔽 нове: сортування
    sortBy: Joi.string()
      .valid(...SORT_FIELDS)
      .default('updatedAt')
      .messages({
        'any.only': `sortBy must be one of: ${SORT_FIELDS.join(', ')}`,
        'string.base': 'sortBy must be a string',
      }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
      'any.only': 'sortOrder must be "asc" or "desc"',
      'string.base': 'sortOrder must be a string',
    }),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.base': 'title must be a string',
      'string.min': 'title should have at least {#limit} character',
      'any.required': 'title is required',
    }),
    content: Joi.string().allow('').messages({
      'string.base': 'content must be a string',
    }),
    tag: Joi.string()
      .valid(...TAGS)
      .required()
      .messages({
        'any.only': `tag must be one of: ${TAGS.join(', ')}`,
        'any.required': 'tag is required',
        'string.base': 'tag must be a string',
      }),
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).messages({
      'string.base': 'title must be a string',
      'string.min': 'title should have at least {#limit} character',
    }),
    content: Joi.string().allow('').messages({
      'string.base': 'content must be a string',
    }),
    tag: Joi.string()
      .valid(...TAGS)
      .messages({
        'any.only': `tag must be one of: ${TAGS.join(', ')}`,
        'string.base': 'tag must be a string',
      }),
  })
    .min(1)
    .messages({
      'object.min':
        'At least one field (title, content, or tag) must be provided',
    }),
};
