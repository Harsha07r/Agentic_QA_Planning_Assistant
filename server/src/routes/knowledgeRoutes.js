import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { searchKnowledge } from '../controllers/knowledgeController.js';

const router = Router();

router.post(
  '/search',
  [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('Query is required'),
  ],
  validate,
  searchKnowledge
);

export default router;
