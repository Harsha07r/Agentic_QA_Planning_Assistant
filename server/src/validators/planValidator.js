import { body, param, query } from 'express-validator';

const TEST_TYPES = ['functional', 'regression', 'integration', 'e2e', 'performance', 'security', 'usability', 'smoke'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['draft', 'active', 'completed', 'archived'];
const TEST_CASE_STATUSES = ['pending', 'passed', 'failed', 'blocked', 'skipped'];

const planFieldsValidation = (required = true) => {
  const opt = (chain) => (required ? chain : chain.optional());

  return [
    opt(body('title')
      .trim()
      .notEmpty()
      .withMessage('Plan title is required')
      .isLength({ max: 150 })
      .withMessage('Title cannot exceed 150 characters')),
    opt(body('projectName')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ max: 100 })
      .withMessage('Project name cannot exceed 100 characters')),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('testScope')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Test scope cannot exceed 2000 characters'),
    body('testTypes')
      .optional()
      .isArray()
      .withMessage('Test types must be an array'),
    body('testTypes.*')
      .optional()
      .isIn(TEST_TYPES)
      .withMessage(`Test type must be one of: ${TEST_TYPES.join(', ')}`),
    body('priority')
      .optional()
      .isIn(PRIORITIES)
      .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
    body('status')
      .optional()
      .isIn(STATUSES)
      .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    body('testCases')
      .optional()
      .isArray()
      .withMessage('Test cases must be an array'),
    body('testCases.*.title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Test case title is required')
      .isLength({ max: 200 })
      .withMessage('Test case title cannot exceed 200 characters'),
    opt(body('acceptanceCriteria')
      .isArray({ min: 1 })
      .withMessage('At least one acceptance criterion is required')),
    opt(body('acceptanceCriteria.*.id')
      .trim()
      .notEmpty()
      .withMessage('Acceptance criterion ID is required')),
    opt(body('acceptanceCriteria.*.description')
      .trim()
      .notEmpty()
      .withMessage('Acceptance criterion description is required')
      .isLength({ max: 1000 })
      .withMessage('Acceptance criterion description cannot exceed 1000 characters')),
    body('testCases.*.description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Test case description cannot exceed 1000 characters'),
    body('testCases.*.steps')
      .optional()
      .isArray()
      .withMessage('Test case steps must be an array'),
    body('testCases.*.expectedResult')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Expected result cannot exceed 500 characters'),
    body('testCases.*.priority')
      .optional()
      .isIn(PRIORITIES)
      .withMessage(`Test case priority must be one of: ${PRIORITIES.join(', ')}`),
    body('testCases.*.status')
      .optional()
      .isIn(TEST_CASE_STATUSES)
      .withMessage(`Test case status must be one of: ${TEST_CASE_STATUSES.join(', ')}`),
  ];
};

export const createPlanValidation = planFieldsValidation(true);

export const updatePlanValidation = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
  ...planFieldsValidation(false),
  body('changeNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Change notes cannot exceed 500 characters'),
];

export const planIdValidation = [
  param('id').isMongoId().withMessage('Invalid plan ID'),
];

export const listPlansValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(STATUSES)
    .withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  query('priority')
    .optional()
    .isIn(PRIORITIES)
    .withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'priority', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const versionQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('planId')
    .optional()
    .isMongoId()
    .withMessage('Invalid plan ID filter'),
];

export { TEST_TYPES, PRIORITIES, STATUSES, TEST_CASE_STATUSES };
