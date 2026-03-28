# GRO-3 MVP Architecture And Acceptance Criteria

Date: 2026-03-29
Issue: GRO-3

## Objective

Define the first production path from guided Q&A input to a stable recommendation handoff so the app can move from data capture into generated growth advice without rewriting the questionnaire layer.

## Current Baseline

The workspace already contains the first questionnaire slice:

- React 19 + TypeScript + Vite single-page app
- six-step guided questionnaire covering stage, model, revenue, goals, channels, and constraints
- local validation and progress tracking
- `localStorage` persistence for in-progress answers
- review screen that emits a `PlanInput` JSON payload
- Vitest coverage for sanitization, validation, and payload creation

This means the architecture should preserve the current client-side capture flow and define a clean boundary for the upcoming recommendation engine instead of redesigning the front end from scratch.

## Proposed Application Shape

### 1. Presentation Layer

- `src/App.tsx` owns step navigation, review, and submit orchestration
- `src/components/QuestionCard.tsx` renders question controls from schema data
- `src/styles.css` carries the MVP visual system

Responsibility:
Collect answers, surface validation, and show the final handoff payload.

### 2. Domain Layer

- `src/data/questionnaire.ts` is the source of truth for question metadata and allowed options
- `src/lib/questionnaire.ts` handles sanitization, validation, completion, labels, and payload creation
- `src/types.ts` defines the questionnaire contract and `PlanInput`

Responsibility:
Keep question rules and payload generation deterministic and testable outside the UI.

### 3. Persistence Layer

- `src/lib/storage.ts` stores sanitized answers in browser `localStorage`

Responsibility:
Recover in-progress sessions without introducing backend complexity in the first slice.

### 4. Recommendation Boundary

The output contract for downstream planning should stay:

```ts
type PlanInput = {
  completedAt: string;
  answers: {
    businessStage: string;
    businessModel: string;
    monthlyRevenue: string;
    growthGoals: string[];
    channels: string[];
    constraints: string;
  };
};
```

Responsibility:
Give `GRO-4` a stable input object for deterministic recommendation generation and rendering.

## Core Data Flow

1. Questionnaire schema defines each prompt, option set, and validation constraint.
2. `App` initializes answer state from `loadAnswers()`.
3. User input updates answer state per question.
4. `saveAnswers()` persists each change to `localStorage`.
5. `validateQuestion()` gates step progression and final submission.
6. Review mode resolves human-readable labels for selected options.
7. `createPlanInput()` produces the canonical `PlanInput` payload.
8. The recommendation engine in [GRO-4](/GRO/issues/GRO-4) should consume that payload and return structured growth suggestions for display.

## Recommendation Engine Contract For GRO-4

`GRO-4` should not consume raw component state. It should accept a `PlanInput` payload and return structured recommendation sections such as:

- prioritized growth bets
- suggested SaaS tools or companies to evaluate
- channel-specific experiments
- execution notes tied to constraints

Recommended next contract:

```ts
type GrowthRecommendation = {
  summary: string;
  bets: Array<{
    title: string;
    rationale: string;
    channels: string[];
    effort: "low" | "medium" | "high";
  }>;
  suggestedTools: Array<{
    name: string;
    category: string;
    reason: string;
  }>;
  nextSteps: string[];
};
```

This keeps generation output structured enough to test and render, even if the recommendation logic starts as rules rather than AI.

## Acceptance Criteria

### First Vertical Slice

- users can complete all six questions from a cold start
- invalid or incomplete answers block forward progress with clear inline errors
- refreshing the page restores in-progress answers from `localStorage`
- review mode shows a readable summary for every question
- submit generates a stable `PlanInput` payload with ISO timestamp and sanitized answers
- tests cover sanitization, validation, and payload creation
- production build completes successfully

### Architecture Guardrails

- questionnaire schema remains the single source of truth for prompt and option definitions
- recommendation generation depends only on `PlanInput`, not React component internals
- domain helpers stay usable in tests without browser rendering
- storage failures fall back to safe defaults instead of breaking the flow

## Risks And Constraints

- The app is currently client-only, so recommendation output will be ephemeral until a backend or export path exists.
- `monthlyRevenue` is stored as a string in the payload; downstream code must normalize it deliberately.
- The current implementation shows raw JSON after submit; `GRO-4` should replace that with structured recommendation UI without removing the debug-friendly contract underneath.
- There is no server-side persistence or analytics yet, so lossless audit/history is out of scope for this MVP.

## Recommended Next Steps

1. Keep the questionnaire contract fixed while [GRO-4](/GRO/issues/GRO-4) builds recommendation generation against `PlanInput`.
2. Introduce recommendation-specific types and tests before adding UI rendering logic.
3. Replace the raw payload panel with a results view that still exposes the serialized input for debugging when needed.
