// src/validations/notesValidation.js
import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import tags from '../contacts/tags.js';

/**
 * Спільний кастом-валідатор для ObjectId
 */
const objectIdJoi = Joi.string()
  .custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Mongo ObjectId validation')
  .messages({
    'any.invalid': 'Invalid id format. Must be a valid MongoDB ObjectId',
    'string.base': 'Id must be a string',
    'any.required': 'Id is required',
  });

/**
 * GET /notes — перевірка query
 *  - page: int >=1, default 1
 *  - perPage: int 5..20, default 10
 *  - tag: один із значень з src/contacts/tags.js
 *  - search: string, може бути порожнім
 */
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
      .valid(...tags)
      .messages({
        'any.only': `tag must be one of: ${tags.join(', ')}`,
        'string.base': 'tag must be a string',
      }),
    search: Joi.string().allow('').messages({
      'string.base': 'search must be a string',
    }),
  }),
};

/**
 * GET /notes/:noteId та DELETE /notes/:noteId — перевірка params
 *  - noteId: валідний ObjectId
 */
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: objectIdJoi.required(),
  }),
};

/**
 * POST /notes — перевірка body
 *  - title: string, min 1, required
 *  - content: string, дозволено порожній рядок
 *  - tag: один із значень із src/contacts/tags.js, required
 */
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
      .valid(...tags)
      .required()
      .messages({
        'any.only': `tag must be one of: ${tags.join(', ')}`,
        'any.required': 'tag is required',
        'string.base': 'tag must be a string',
      }),
  }),
};

/**
 * PATCH /notes/:noteId — перевірка params + body
 *  - params.noteId: валідний ObjectId
 *  - body: title/content/tag — усі необов’язкові,
 *          але якщо присутні — мають пройти валідацію
 */
export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: objectIdJoi.required(),
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
      .valid(...tags)
      .messages({
        'any.only': `tag must be one of: ${tags.join(', ')}`,
        'string.base': 'tag must be a string',
      }),
  })
    .min(1)
    .messages({
      'object.min':
        'At least one field (title, content, or tag) must be provided',
    }),
};
