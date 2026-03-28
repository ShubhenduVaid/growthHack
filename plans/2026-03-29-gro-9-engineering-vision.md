# GRO-9 Engineering Vision And Roadmap

Date: 2026-03-29
Issue: GRO-9

## Objective

Define the engineering direction for the growth-plan product now that the first MVP slice exists. The goal is to align engineering, QA, and design on a shared architecture, execution sequence, and quality bar so future work compounds instead of fragmenting.

## Current Baseline

The product already has a working first slice:

- React 19 + TypeScript + Vite single-page app
- guided six-step questionnaire for stage, model, revenue, goals, channels, and constraints
- deterministic `PlanInput` payload creation from sanitized answers
- local recommendation generation with structured bets, tools, reference companies, and next steps
- browser persistence through `localStorage`
- passing Vitest coverage for questionnaire and recommendation helpers
- successful production build

Completed implementation and planning inputs already exist in:

- [GRO-2](/GRO/issues/GRO-2): guided Q&A flow
- [GRO-3](/GRO/issues/GRO-3): MVP architecture and acceptance criteria
- [GRO-4](/GRO/issues/GRO-4): recommendation and results generation

This means the engineering vision should preserve the current vertical slice, harden its contracts, and create a clean path to more trustworthy and operationally usable recommendations.

## Product And Engineering Thesis

The product should evolve as a contract-first recommendation system:

1. Capture structured business context through a tight onboarding flow.
2. Normalize that input into stable domain contracts.
3. Generate recommendations through deterministic, testable logic first.
4. Add richer evidence, persistence, and service boundaries only after the contracts are stable.

This keeps the product shippable while reducing the risk of rebuilding the front end or recommendation engine each time the logic changes.

## Target Architecture

### 1. Experience Layer

- React app owns questionnaire flow, review, recommendation display, and future export/share actions.
- Components stay presentation-focused.
- Navigation, submission state, and view transitions stay explicit in app-level orchestration.

Primary responsibility:
Make the onboarding and results flow understandable, fast, and trustworthy.

### 2. Domain Contract Layer

- `questionnaire.ts` remains the source of truth for prompts and allowed values.
- `questionnaire.ts` helpers continue to sanitize, validate, and serialize user input.
- `types.ts` becomes the stable contract boundary between capture, generation, rendering, and future APIs.

Primary responsibility:
Protect the product from UI-coupled business logic and accidental schema drift.

### 3. Recommendation Engine Layer

- Recommendation generation should continue to consume only `PlanInput`.
- Rules stay deterministic and fully testable while the product is still calibrating recommendation quality.
- Future AI-assisted generation should sit behind the same contract and produce a structured output shape rather than raw prose.

Primary responsibility:
Turn normalized input into explainable, renderable growth guidance.

### 4. Persistence And Delivery Layer

- Current `localStorage` persistence is acceptable for the MVP.
- The next persistence step should be saved sessions and generated plans, not a broad backend rewrite.
- Introduce server-side storage only when the team needs durable plans, collaboration, exports, analytics, or model-backed generation.

Primary responsibility:
Persist useful product state without forcing premature infrastructure.

### 5. Quality And Release Layer

- Unit tests should cover all contract and recommendation logic.
- QA should define regression coverage for the questionnaire, results rendering, and storage recovery paths.
- Builds must stay green before any release handoff.
- Design review should be required when changing onboarding clarity, results trust signals, or information hierarchy.

Primary responsibility:
Keep speed high without letting product trust decay.

## Engineering Principles

- Contract first: change types and data boundaries intentionally, not incidentally through UI work.
- Deterministic before magical: rule-based and testable logic is the right default until recommendation quality is well understood.
- Narrow vertical slices: ship end-to-end improvements instead of building disconnected infrastructure.
- Explicit quality gates: every feature needs acceptance criteria, regression expectations, and release validation.
- Design for trust: recommendations must feel readable, grounded, and appropriately scoped.

## Roadmap

### Phase 1: Harden The Existing MVP Slice

Outcome:
Treat the current questionnaire-to-recommendation flow as the stable core.

Work:

- keep `PlanInput` and `GrowthRecommendation` as explicit contracts
- tighten tests around payload shape and recommendation invariants
- reduce coupling between `App.tsx` orchestration and future feature expansion
- define QA smoke coverage for cold start, resume, submit, and results rendering
- apply design polish to improve trust and scanability in the onboarding and results views

Exit criteria:

- contract changes are deliberate and tested
- QA has a lightweight regression checklist
- design feedback on the MVP flow is incorporated

Approved execution queue:

- [GRO-14](/GRO/issues/GRO-14): harden questionnaire contracts and persisted state boundaries
- [GRO-15](/GRO/issues/GRO-15): extract onboarding flow orchestration out of `App.tsx`
- [GRO-16](/GRO/issues/GRO-16): expand deterministic recommendation invariant coverage
- [GRO-17](/GRO/issues/GRO-17): add QA support hooks for smoke coverage
- [GRO-18](/GRO/issues/GRO-18): implement trust-focused polish for onboarding and results

Execution sequence:

1. Start with [GRO-14](/GRO/issues/GRO-14) to stabilize capture, persistence, and contract behavior.
2. Move into [GRO-15](/GRO/issues/GRO-15) so the flow boundary is explicit and the known validation bypass is removed.
3. Land [GRO-16](/GRO/issues/GRO-16) to lock recommendation invariants before new output logic is added.
4. Run [GRO-17](/GRO/issues/GRO-17) and [GRO-18](/GRO/issues/GRO-18) in parallel once the refactor boundary is clear.

Phase 1 release bar:

- direct step navigation must not bypass validation; current blocker is tracked in [GRO-15](/GRO/issues/GRO-15)
- QA gates from [GRO-11](/GRO/issues/GRO-11#document-qa-gates) govern release for questionnaire validation, storage recovery, recommendation integrity, and smoke coverage
- design acceptance requires clearer onboarding promise, hidden-by-default debug payload, stronger rationale/trust cues in results, and mobile-first navigation/readability expectations from [GRO-12](/GRO/issues/GRO-12)

### Phase 2: Increase Recommendation Trustworthiness

Outcome:
Make the output more defensible and useful without needing a full backend platform.

Work:

- add recommendation metadata such as assumptions, why-this-fit rationale, and confidence signals
- introduce richer result sections for prioritization, sequencing, and constraints-aware tradeoffs
- support debug visibility for generated output without exposing implementation details to normal users
- expand tests to cover edge cases across stage, revenue, goal, and channel combinations

Exit criteria:

- results feel specific rather than generic
- recommendation coverage across core personas is testable
- QA can review output quality against defined scenarios

### Phase 3: Add Durable Product State

Outcome:
Move from a demoable client app to a product with saved progress and reusable plans.

Work:

- persist questionnaire sessions and generated plans outside the browser
- define a server/API boundary around `PlanInput` submission and recommendation retrieval
- add analytics or event instrumentation around onboarding completion and recommendation usage
- support share/export pathways for generated plans

Exit criteria:

- plans survive devices or browser resets
- the recommendation pipeline can be observed and debugged
- product usage signals are available for iteration

### Phase 4: Evolve Into A Growth Planning System

Outcome:
Turn one-off recommendations into an iterative operating system for growth planning.

Work:

- support editable plans, saved experiments, and recommendation history
- introduce company and tool references with stronger evidence links
- evaluate AI-assisted generation only behind structured output contracts and review gates
- create role-aware workflows for founders, operators, or teams reviewing the plan together

Exit criteria:

- the product supports iteration, not just first-pass output
- recommendation quality can improve without breaking downstream consumers

## Team Ownership

### CTO

- own architecture direction, contract discipline, and sequencing
- keep roadmap aligned with product reality and team capacity
- approve major changes to app structure, recommendation boundaries, and infrastructure timing

### Founding Engineer

- own implementation backlog, code quality, and technical decomposition
- convert roadmap phases into concrete tickets with acceptance criteria
- keep the app architecture simple while preserving extension paths

### Founding QA Lead

- define release gates, scenario coverage, and regression expectations
- pressure-test edge cases in questionnaire validation, results integrity, and persistence
- gate releases when user trust or core flow stability is at risk

### Founding Designer

- own onboarding clarity, information hierarchy, and recommendation trust signals
- ensure the product feels credible, readable, and intentional on desktop and mobile
- shape the visual and UX system before the team scales output complexity

## Immediate Next Moves

1. Drive [GRO-14](/GRO/issues/GRO-14) and [GRO-15](/GRO/issues/GRO-15) first because they establish the safe contract and flow boundary for the rest of Phase 1.
2. Use [GRO-11](/GRO/issues/GRO-11#document-qa-gates) as the active release bar during execution.
3. Carry the design acceptance criteria from [GRO-12](/GRO/issues/GRO-12) directly into [GRO-18](/GRO/issues/GRO-18) so trust/readability work lands as part of hardening, not post-hoc polish.
4. Close the planning tickets once execution ownership and release gates are fully linked.

## Decision

The team should not add backend or AI complexity yet. The right next step is to harden the existing front-end recommendation pipeline, remove the known flow-validation gap, improve recommendation trust/readability, and execute against explicit engineering, QA, and design gates around the current slice.
