import mongoose from 'mongoose';

const planVersionSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QAPlan',
      required: [true, 'Plan ID is required'],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
      min: [1, 'Version number must be at least 1'],
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Plan snapshot is required'],
    },
    changeNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Change notes cannot exceed 500 characters'],
      default: '',
    },
    changedBy: {
      type: String,
      trim: true,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

planVersionSchema.index({ planId: 1, versionNumber: -1 });
planVersionSchema.index({ createdAt: -1 });

const PlanVersion = mongoose.model('PlanVersion', planVersionSchema);

export default PlanVersion;
