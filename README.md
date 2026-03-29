# Growth Plan MVP

This repository contains the first implementation slice of the growth planning product: a questionnaire-driven React app that captures structured business inputs and turns them into a deterministic recommendation payload.

## What is included

- A multi-step questionnaire for business stage, model, revenue, goals, channels, and constraints
- Recommendation generation logic with deterministic example outputs
- Persistence helpers for saving the in-progress questionnaire locally
- Unit tests for answer sanitization, validation, and recommendation generation

## Stack

- React 19
- TypeScript
- Vite
- Vitest
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` starts the Vite development server
- `pnpm test` runs the Vitest suite
- `pnpm build` runs TypeScript compilation and creates a production build

## QA Smoke Mode

Append `?qa=1` to the local app URL to reveal a hidden QA panel. The default product experience does not render these controls unless QA mode is explicitly enabled.

Example local URLs:

- `http://localhost:5173/?qa=1` keeps the current saved answers intact and only reveals the QA panel
- `http://localhost:5173/?qa=1&fixture=empty` clears storage and opens the cold-start path
- `http://localhost:5173/?qa=1&fixture=resume` restores a partial in-progress questionnaire on the next unanswered step
- `http://localhost:5173/?qa=1&fixture=ready` restores a complete questionnaire on review, ready to submit
- `http://localhost:5173/?qa=1&fixture=submitted` restores a complete questionnaire with recommendations already visible
- `http://localhost:5173/?qa=1&fixture=invalid-storage` seeds stale option ids and invalid values to verify sanitize recovery
- `http://localhost:5173/?qa=1&fixture=malformed-storage` seeds malformed JSON to verify safe storage fallback

Smoke path checklist:

1. Cold start: open `?qa=1&fixture=empty` and confirm step 1 is empty with no persisted answers.
2. Resume: open `?qa=1&fixture=resume`, refresh once, and confirm the saved answers restore while the flow lands on the next unanswered step.
3. Validation error: from `resume`, click `Continue` on the unanswered step and confirm the inline validation message appears.
4. Submit: open `?qa=1&fixture=ready`, confirm all review values are readable, then click `Submit For Recommendations`.
5. Recommendation refresh: from the submitted review state, click `Refresh Recommendations` and confirm the timestamp updates while the payload and recommendations remain consistent.
6. Recovery: open the `invalid-storage` and `malformed-storage` fixtures and confirm the app falls back to a safe state without crashing.

Stable selectors for future browser smoke automation are exposed through `data-testid` attributes on the main questionnaire navigation, answer controls, review state, payload panel, recommendation results, and QA fixture links.

## Engineering baseline

- Generated artifacts and local-only folders are ignored via `.gitignore`
- CI runs tests and the production build on pushes and pull requests
- The app logic is covered by unit tests for the main questionnaire and recommendation paths
