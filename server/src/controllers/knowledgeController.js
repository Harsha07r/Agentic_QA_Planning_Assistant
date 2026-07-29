import knowledgeBaseService from '../knowledge/KnowledgeBaseService.js';

export const searchKnowledge = async (req, res) => {
  const { query } = req.body;
  await knowledgeBaseService.loadKnowledge();
  const documents = await knowledgeBaseService.searchKnowledge(query);

  res.status(200).json({
    success: true,
    documents,
  });
};
