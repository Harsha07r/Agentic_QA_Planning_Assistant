# AGENT_USAGE.md

## AI Tools Used

- ChatGPT (OpenAI)
- GitHub Copilot

## Representative Prompts

Examples of prompts used during development:

- Design a scalable Express.js folder structure.
- Improve the Gemini prompt for structured JSON output.
- Suggest React component organization.
- Review API error handling.
- Improve dashboard UI responsiveness.

## Work Delegated to AI

AI tools were used to assist with:

- Code review
- Refactoring suggestions
- Prompt engineering
- UI improvement ideas
- Documentation drafting
- Debugging deployment issues

All generated suggestions were manually reviewed, modified where necessary, and tested before being included.

## Important AI Mistake

An early deployment configuration used a relative API base URL (`/api`), causing the frontend to call itself instead of the backend. This was corrected by switching to an environment-variable-based API URL.

## Verification

All AI-generated code and suggestions were verified by:

- Local testing
- CRUD testing
- AI test generation testing
- Dashboard verification
- Version history verification
- End-to-end deployment testing on Render and Vercel