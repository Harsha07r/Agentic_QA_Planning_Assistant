import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { generateTests } from '../controllers/aiController.js';

const router = Router();

router.post(
  '/generate',
  [
    body('requirement').trim().notEmpty().withMessage('Requirement is required'),
    body('implementationSummary').trim().notEmpty().withMessage('Implementation summary is required'),
    body('acceptanceCriteria')
      .isArray({ min: 1 })
      .withMessage('Acceptance criteria are required'),
    body('acceptanceCriteria.*.description')
      .trim()
      .notEmpty()
      .withMessage('Acceptance criterion description is required'),
  ],
  validate,
  generateTests
);

export default router;
