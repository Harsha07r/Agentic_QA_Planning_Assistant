import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import knowledgeBaseService from '../knowledge/KnowledgeBaseService.js';
import { AppError } from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_MODEL = 'gemini-1.5-mini';
const GEMINI_ENDPOINT = `https://gemini.googleapis.com/v1/models/${GEMINI_MODEL}:generateText`;

class AIService {
  async generateTests({ requirement, acceptanceCriteria, implementationSummary }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError('Missing GEMINI_API_KEY environment variable', 500);
    }

    const guidelineQuery = this._buildGuidelineQuery({ requirement, acceptanceCriteria, implementationSummary });
    const guidelineSections = await knowledgeBaseService.searchKnowledge(guidelineQuery);
    const prompt = this._buildPrompt({ requirement, acceptanceCriteria, implementationSummary, guidelineSections });
    const responseText = await this._callGemini(prompt, apiKey);
    const payload = this._extractJson(responseText);
    return this._validatePayload(payload);
  }

  _buildGuidelineQuery({ requirement, acceptanceCriteria, implementationSummary }) {
    const acceptanceText = acceptanceCriteria
      .map((item) => item.description || item.id || '')
      .filter(Boolean)
      .join(' ');

    return [requirement, acceptanceText, implementationSummary].filter(Boolean).join(' ');
  }

  _buildPrompt({ requirement, acceptanceCriteria, implementationSummary, guidelineSections }) {
    const acceptanceText = acceptanceCriteria
      .map((item) => `- ${item.id || ''}: ${item.description}`)
      .join('\n');

    const guidelineText = guidelineSections
      .map((section, index) => `Section ${index + 1}: ${section.title}\n${section.snippet}`)
      .join('\n\n');

    return `Generate a JSON-only QA test plan for the following feature request. Do not include any prose outside of valid JSON.

Requirement:\n${requirement}\n\nAcceptance Criteria:\n${acceptanceText}\n\nImplementation Summary:\n${implementationSummary}\n\nRelevant QA guidelines:\n${guidelineText}\n\nOutput only a JSON object with the following shape:\n{
  "tests": [
    {
      "id": "",
      "title": "",
      "category": "",
      "description": "",
      "mappedAcceptanceCriteria": [],
      "whyRelevant": "",
      "assumptions": "",
      "priority": ""
    }
  ]
}

Include a broad range of test types: unit tests, API tests, integration tests, end-to-end tests, Playwright tests, manual tests, edge cases, permission cases, failure states, and regression areas. Ensure the JSON is syntactically valid.`;
  }

  async _callGemini(prompt, apiKey) {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.2,
        max_output_tokens: 1200,
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      const errorMessage = `Gemini API request failed with status ${response.status}: ${body}`;
      throw new AppError(errorMessage, 502);
    }

    return body;
  }

  _extractJson(responseText) {
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const jsonString = responseText.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonString);
        } catch (nestedError) {
          throw new AppError('Gemini response contained invalid JSON', 502);
        }
      }
      throw new AppError('Gemini response did not contain valid JSON', 502);
    }
  }

  _validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new AppError('AI response payload must be a JSON object', 502);
    }

    if (!Array.isArray(payload.tests)) {
      throw new AppError('AI response JSON must include a tests array', 502);
    }

    const normalizedTests = payload.tests.map((test, index) => {
      if (!test || typeof test !== 'object') {
        throw new AppError(`Invalid test object at index ${index}`, 502);
      }

      return {
        id: String(test.id || `T-${index + 1}`),
        title: String(test.title || ''),
        category: String(test.category || ''),
        description: String(test.description || ''),
        mappedAcceptanceCriteria: Array.isArray(test.mappedAcceptanceCriteria)
          ? test.mappedAcceptanceCriteria.map(String)
          : [],
        whyRelevant: String(test.whyRelevant || ''),
        assumptions: String(test.assumptions || ''),
        priority: String(test.priority || ''),
      };
    });

    return { tests: normalizedTests };
  }
}

const aiService = new AIService();
export default aiService;
