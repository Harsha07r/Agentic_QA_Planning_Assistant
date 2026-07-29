import { GoogleGenAI } from "@google/genai";
import knowledgeBaseService from '../knowledge/KnowledgeBaseService.js';
import { AppError } from '../utils/AppError.js';

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
  const ai = new GoogleGenAI({ apiKey });

  const models = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`Using Gemini model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });

      const text =
        typeof response.text === "function"
          ? await response.text()
          : response.text;

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    } catch (err) {
      lastError = err;

      // Try the next model if this one is unavailable or rate-limited
      if ([404, 429, 503].includes(err.status)) {
        console.warn(
          `Model "${model}" unavailable (${err.status}). Trying next model...`
        );
        continue;
      }

      throw err;
    }
  }

  throw new AppError(
    `All Gemini models failed. Last error: ${lastError?.message}`,
    502
  );
}

_extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new AppError("Gemini returned an empty response", 502);
  }

  let cleaned = text.trim();

  // Remove markdown fences
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // Try parsing directly
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Extract first JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const json = cleaned.substring(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(json);
    } catch {}
  }

  throw new AppError("Gemini returned invalid JSON", 502);
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
