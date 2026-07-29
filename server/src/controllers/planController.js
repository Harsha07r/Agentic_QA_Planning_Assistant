import QAPlan from '../models/QAPlan.js';
import PlanVersion from '../models/PlanVersion.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

const createVersionSnapshot = (plan) => ({
  title: plan.title,
  description: plan.description,
  projectName: plan.projectName,
  testScope: plan.testScope,
  testTypes: plan.testTypes,
  priority: plan.priority,
  status: plan.status,
  tags: plan.tags,
  testCases: plan.testCases,
  acceptanceCriteria: plan.acceptanceCriteria,
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalPlans, statusBreakdown, recentPlans, totalVersions] = await Promise.all([
    QAPlan.countDocuments(),
    QAPlan.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    QAPlan.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title projectName status priority updatedAt version'),
    PlanVersion.countDocuments(),
  ]);

  const statusMap = statusBreakdown.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const totalTestCases = await QAPlan.aggregate([
    { $project: { testCaseCount: { $size: '$testCases' } } },
    { $group: { _id: null, total: { $sum: '$testCaseCount' } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPlans,
      totalVersions,
      totalTestCases: totalTestCases[0]?.total || 0,
      statusBreakdown: statusMap,
      recentPlans,
    },
  });
});

export const getPlans = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { projectName: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const [plans, total] = await Promise.all([
    QAPlan.find(filter).sort(sort).skip(skip).limit(limit),
    QAPlan.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: plans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await QAPlan.findById(req.params.id);

  if (!plan) {
    throw new AppError('QA plan not found', 404);
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await QAPlan.create(req.body);

  await PlanVersion.create({
    planId: plan._id,
    versionNumber: 1,
    snapshot: createVersionSnapshot(plan),
    changeNotes: 'Initial version',
  });

  res.status(201).json({
    success: true,
    message: 'QA plan created successfully',
    data: plan,
  });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const { changeNotes, ...updateData } = req.body;

  const existingPlan = await QAPlan.findById(req.params.id);

  if (!existingPlan) {
    throw new AppError('QA plan not found', 404);
  }

  const newVersionNumber = existingPlan.version + 1;

  const plan = await QAPlan.findByIdAndUpdate(
    req.params.id,
    { ...updateData, version: newVersionNumber },
    { new: true, runValidators: true }
  );

  await PlanVersion.create({
    planId: plan._id,
    versionNumber: newVersionNumber,
    snapshot: createVersionSnapshot(plan),
    changeNotes: changeNotes || `Updated to version ${newVersionNumber}`,
  });

  res.status(200).json({
    success: true,
    message: 'QA plan updated successfully',
    data: plan,
  });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await QAPlan.findByIdAndDelete(req.params.id);

  if (!plan) {
    throw new AppError('QA plan not found', 404);
  }

  await PlanVersion.deleteMany({ planId: req.params.id });

  res.status(200).json({
    success: true,
    message: 'QA plan and its version history deleted successfully',
  });
});

export const getPlanVersions = asyncHandler(async (req, res) => {
  const plan = await QAPlan.findById(req.params.id).select('title projectName version');

  if (!plan) {
    throw new AppError('QA plan not found', 404);
  }

  const versions = await PlanVersion.find({ planId: req.params.id })
    .sort({ versionNumber: -1 })
    .select('-snapshot');

  res.status(200).json({
    success: true,
    data: {
      plan,
      versions,
    },
  });
});

export const getVersionById = asyncHandler(async (req, res) => {
  const version = await PlanVersion.findById(req.params.versionId);

  if (!version) {
    throw new AppError('Version not found', 404);
  }

  if (version.planId.toString() !== req.params.id) {
    throw new AppError('Version does not belong to this plan', 404);
  }

  res.status(200).json({
    success: true,
    data: version,
  });
});

export const getAllVersions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.planId) filter.planId = req.query.planId;

  const [versions, total] = await Promise.all([
    PlanVersion.find(filter)
      .populate('planId', 'title projectName status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-snapshot'),
    PlanVersion.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: versions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const restoreVersion = asyncHandler(async (req, res) => {
  const version = await PlanVersion.findById(req.params.versionId);

  if (!version) {
    throw new AppError('Version not found', 404);
  }

  if (version.planId.toString() !== req.params.id) {
    throw new AppError('Version does not belong to this plan', 404);
  }

  const existingPlan = await QAPlan.findById(req.params.id);

  if (!existingPlan) {
    throw new AppError('QA plan not found', 404);
  }

  const newVersionNumber = existingPlan.version + 1;
  const snapshot = version.snapshot;

  const plan = await QAPlan.findByIdAndUpdate(
    req.params.id,
    {
      ...snapshot,
      version: newVersionNumber,
    },
    { new: true, runValidators: true }
  );

  await PlanVersion.create({
    planId: plan._id,
    versionNumber: newVersionNumber,
    snapshot: createVersionSnapshot(plan),
    changeNotes: `Restored from version ${version.versionNumber}`,
  });

  res.status(200).json({
    success: true,
    message: `Plan restored from version ${version.versionNumber}`,
    data: plan,
  });
});
