import aiService from '../ai/AIService.js';
import { asyncHandler } from '../utils/AppError.js';

export const generateTests = asyncHandler(async (req, res) => {
  const { requirement, acceptanceCriteria, implementationSummary } = req.body;

  if (!requirement || !implementationSummary) {
    return res.status(400).json({
      success: false,
      message: 'Requirement and implementation summary are required',
    });
  }

  if (!Array.isArray(acceptanceCriteria) || acceptanceCriteria.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Acceptance criteria are required',
    });
  }

  const result = await aiService.generateTests({ requirement, acceptanceCriteria, implementationSummary });
  res.status(200).json({ success: true, ...result });
});
