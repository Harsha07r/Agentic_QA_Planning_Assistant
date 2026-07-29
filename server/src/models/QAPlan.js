import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test case title is required'],
      trim: true,
      maxlength: [200, 'Test case title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Test case description cannot exceed 1000 characters'],
      default: '',
    },
    steps: {
      type: [String],
      default: [],
    },
    expectedResult: {
      type: String,
      trim: true,
      maxlength: [500, 'Expected result cannot exceed 500 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'blocked', 'skipped'],
      default: 'pending',
    },
  },
  { _id: true }
);

const qaPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    testScope: {
      type: String,
      trim: true,
      maxlength: [2000, 'Test scope cannot exceed 2000 characters'],
      default: '',
    },
    testTypes: {
      type: [String],
      enum: ['functional', 'regression', 'integration', 'e2e', 'performance', 'security', 'usability', 'smoke'],
      default: [],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'draft',
    },
    tags: {
      type: [String],
      default: [],
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    acceptanceCriteria: {
      type: [
        {
          id: {
            type: String,
            required: [true, 'Acceptance criterion ID is required'],
            trim: true,
          },
          description: {
            type: String,
            required: [true, 'Acceptance criterion description is required'],
            trim: true,
            maxlength: [1000, 'Acceptance criterion description cannot exceed 1000 characters'],
          },
        },
      ],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one acceptance criterion is required',
      },
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

qaPlanSchema.index({ title: 'text', projectName: 'text', description: 'text' });
qaPlanSchema.index({ status: 1, createdAt: -1 });
qaPlanSchema.index({ projectName: 1 });

const QAPlan = mongoose.model('QAPlan', qaPlanSchema);

export default QAPlan;
