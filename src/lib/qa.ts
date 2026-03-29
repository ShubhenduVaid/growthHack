import { createOnboardingFlowState, reviewStepIndex, type OnboardingFlowState } from "./onboardingFlow";
import { sanitizeAnswers } from "./questionnaire";
import type { QuestionnaireAnswers } from "../types";

export type QaFixtureKey =
  | "empty"
  | "resume"
  | "ready"
  | "submitted"
  | "invalid-storage"
  | "malformed-storage";

type QaStorageInstruction =
  | { kind: "clear" }
  | { kind: "answers"; answers: QuestionnaireAnswers }
  | { kind: "raw"; raw: string };

type QaFixtureDefinition = {
  key: QaFixtureKey;
  label: string;
  description: string;
  storage: QaStorageInstruction;
  state?: {
    answers: QuestionnaireAnswers;
    activeStep?: number;
    submittedAt?: string | null;
  };
};

export type QaStorageOps = {
  clear: () => void;
  save: (answers: QuestionnaireAnswers) => void;
  writeRaw: (raw: string) => void;
};

const qaModeSearchParam = "qa";
const qaFixtureSearchParam = "fixture";

const resumeAnswers = sanitizeAnswers({
  businessStage: "launching",
  businessModel: "saas",
  monthlyRevenue: "2500"
});

const readyAnswers = sanitizeAnswers({
  businessStage: "launching",
  businessModel: "saas",
  monthlyRevenue: "2500",
  growthGoals: ["acquisition", "activation"],
  channels: ["seo", "outbound"],
  constraints: "Two founders, lean paid budget, one AE."
});

const qaSubmittedAt = "2026-03-29 11:15 AM";

const qaFixtures: Record<QaFixtureKey, QaFixtureDefinition> = {
  empty: {
    key: "empty",
    label: "Cold Start",
    description: "Clears saved answers and opens the app at step 1.",
    storage: { kind: "clear" },
    state: {
      answers: sanitizeAnswers(null)
    }
  },
  resume: {
    key: "resume",
    label: "Resume Progress",
    description: "Seeds partial progress and lands on the next unanswered step.",
    storage: { kind: "answers", answers: resumeAnswers },
    state: {
      answers: resumeAnswers,
      activeStep: 3
    }
  },
  ready: {
    key: "ready",
    label: "Ready To Submit",
    description: "Loads a complete questionnaire and lands on review without results.",
    storage: { kind: "answers", answers: readyAnswers },
    state: {
      answers: readyAnswers,
      activeStep: reviewStepIndex
    }
  },
  submitted: {
    key: "submitted",
    label: "Submitted Results",
    description: "Loads a complete questionnaire with recommendations already visible.",
    storage: { kind: "answers", answers: readyAnswers },
    state: {
      answers: readyAnswers,
      activeStep: reviewStepIndex,
      submittedAt: qaSubmittedAt
    }
  },
  "invalid-storage": {
    key: "invalid-storage",
    label: "Invalid Storage Recovery",
    description: "Seeds stale option ids and invalid values so sanitize recovery can be checked.",
    storage: {
      kind: "raw",
      raw: JSON.stringify({
        businessStage: "legacy-stage",
        businessModel: "saas",
        monthlyRevenue: "-200",
        growthGoals: ["ghost-goal"],
        channels: ["outbound", "old-channel"],
        constraints: 42
      })
    }
  },
  "malformed-storage": {
    key: "malformed-storage",
    label: "Malformed Storage Recovery",
    description: "Seeds malformed JSON so the app falls back to a safe default state.",
    storage: {
      kind: "raw",
      raw: "{\"businessStage\":\"launching\""
    }
  }
};

const getSearchParams = (search: string): URLSearchParams => new URLSearchParams(search);

export const isQaModeEnabled = (search: string): boolean => getSearchParams(search).get(qaModeSearchParam) === "1";

export const getQaFixtureKey = (search: string): QaFixtureKey | null => {
  const fixture = getSearchParams(search).get(qaFixtureSearchParam);

  if (!fixture) {
    return null;
  }

  return fixture in qaFixtures ? (fixture as QaFixtureKey) : null;
};

export const getQaFixtures = (): QaFixtureDefinition[] => Object.values(qaFixtures);

export const getQaActiveFixture = (search: string): QaFixtureDefinition | null => {
  const key = getQaFixtureKey(search);
  return key ? qaFixtures[key] : null;
};

export const prepareQaMode = (search: string, storageOps: QaStorageOps): QaFixtureKey | null => {
  if (!isQaModeEnabled(search)) {
    return null;
  }

  const fixtureKey = getQaFixtureKey(search);

  if (!fixtureKey) {
    return null;
  }

  const fixture = qaFixtures[fixtureKey];

  switch (fixture.storage.kind) {
    case "clear":
      storageOps.clear();
      break;
    case "answers":
      storageOps.save(fixture.storage.answers);
      break;
    case "raw":
      storageOps.writeRaw(fixture.storage.raw);
      break;
  }

  return fixture.key;
};

export const resolveQaInitialState = (
  search: string,
  fallbackAnswers: QuestionnaireAnswers
): OnboardingFlowState | null => {
  if (!isQaModeEnabled(search)) {
    return null;
  }

  const fixture = getQaActiveFixture(search);

  if (!fixture?.state) {
    return createOnboardingFlowState(fallbackAnswers);
  }

  return createOnboardingFlowState(fixture.state.answers, {
    activeStep: fixture.state.activeStep,
    submittedAt: fixture.state.submittedAt ?? null
  });
};

export const buildQaHref = (pathname: string, fixtureKey?: QaFixtureKey): string => {
  const query = fixtureKey ? `?${qaModeSearchParam}=1&${qaFixtureSearchParam}=${fixtureKey}` : `?${qaModeSearchParam}=1`;
  return `${pathname}${query}`;
};

export const getQaSubmittedAt = (): string => qaSubmittedAt;
