# Playwright Testing

## Browser-based validation
- Use Playwright for end-to-end flows that cover real user interactions.
- Test navigation, form submissions, and UI feedback in supported browsers.
- Capture screenshots on failures to simplify bug triage.

## Best practices
- Keep E2E tests small and focused on user journeys.
- Use selectors that are robust and avoid brittle DOM paths.
- Combine API and UI checks to validate both frontend behavior and backend state.

## Maintenance
- Run Playwright tests regularly in CI for critical paths.
- Isolate flaky tests and triage root causes immediately.
- Keep test data reset and deterministic across runs.
