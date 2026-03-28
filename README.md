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

## Engineering baseline

- Generated artifacts and local-only folders are ignored via `.gitignore`
- CI runs tests and the production build on pushes and pull requests
- The app logic is covered by unit tests for the main questionnaire and recommendation paths
