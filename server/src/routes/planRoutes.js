import { Router } from 'express';
import {
  getDashboardStats,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanVersions,
  getVersionById,
  getAllVersions,
  restoreVersion,
} from '../controllers/planController.js';
import { validate } from '../middleware/validate.js';
import {
  createPlanValidation,
  updatePlanValidation,
  planIdValidation,
  listPlansValidation,
  versionQueryValidation,
} from '../validators/planValidator.js';

const router = Router();

router.get('/dashboard/stats', getDashboardStats);

router.get('/versions', versionQueryValidation, validate, getAllVersions);

router
  .route('/')
  .get(listPlansValidation, validate, getPlans)
  .post(createPlanValidation, validate, createPlan);

router
  .route('/:id')
  .get(planIdValidation, validate, getPlanById)
  .put(updatePlanValidation, validate, updatePlan)
  .delete(planIdValidation, validate, deletePlan);

router.get('/:id/versions', planIdValidation, validate, getPlanVersions);

router.get(
  '/:id/versions/:versionId',
  planIdValidation,
  validate,
  getVersionById
);

router.post(
  '/:id/versions/:versionId/restore',
  planIdValidation,
  validate,
  restoreVersion
);

export default router;
