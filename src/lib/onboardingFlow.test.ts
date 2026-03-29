import { describe, expect, it } from "vitest";
import { sanitizeAnswers } from "./questionnaire";
import {
  buildReviewSections,
  createOnboardingFlowState,
  onboardingFlowReducer,
  reviewStepIndex
} from "./onboardingFlow";

const validAnswers = sanitizeAnswers({
  businessStage: "launching",
  businessModel: "saas",
  monthlyRevenue: "2500",
  growthGoals: ["acquisition", "activation"],
  channels: ["seo", "outbound"],
  constraints: "Two founders, lean paid budget, one AE."
});

describe("onboarding flow reducer", () => {
  it("blocks continue when the current question is invalid", () => {
    const state = createOnboardingFlowState(sanitizeAnswers(null));

    const nextState = onboardingFlowReducer(state, { type: "stepContinued" });

    expect(nextState.activeStep).toBe(0);
    expect(nextState.showErrors).toBe(true);
  });

  it("advances, jumps, and steps back through the questionnaire bounds", () => {
    const advancedState = onboardingFlowReducer(createOnboardingFlowState(validAnswers), { type: "stepContinued" });
    const reviewState = onboardingFlowReducer(advancedState, { type: "stepSelected", step: 999 });
    const previousState = onboardingFlowReducer(reviewState, { type: "stepBack" });

    expect(advancedState.activeStep).toBe(1);
    expect(reviewState.activeStep).toBe(reviewStepIndex);
    expect(previousState.activeStep).toBe(reviewStepIndex - 1);
  });

  it("routes forward jumps to the first invalid question instead of bypassing validation", () => {
    const state = createOnboardingFlowState(
      sanitizeAnswers({
        businessStage: "launching"
      })
    );

    const nextState = onboardingFlowReducer(state, { type: "stepSelected", step: 4 });

    expect(nextState.activeStep).toBe(1);
    expect(nextState.showErrors).toBe(true);
  });

  it("blocks direct review jumps when earlier questions are still invalid", () => {
    const state = createOnboardingFlowState(
      sanitizeAnswers({
        businessStage: "launching",
        businessModel: "saas"
      })
    );

    const nextState = onboardingFlowReducer(state, { type: "stepSelected", step: reviewStepIndex });

    expect(nextState.activeStep).toBe(2);
    expect(nextState.showErrors).toBe(true);
  });

  it("clears visible validation state after an answer change", () => {
    const state = {
      ...createOnboardingFlowState(sanitizeAnswers(null)),
      showErrors: true
    };

    const nextState = onboardingFlowReducer(state, {
      type: "answerChanged",
      questionId: "businessStage",
      value: "launching"
    });

    expect(nextState.answers.businessStage).toBe("launching");
    expect(nextState.showErrors).toBe(false);
  });

  it("sends submit back to the first invalid question when answers are incomplete", () => {
    const state = {
      ...createOnboardingFlowState(
        sanitizeAnswers({
          businessStage: "launching",
          businessModel: "saas"
        })
      ),
      activeStep: reviewStepIndex
    };

    const nextState = onboardingFlowReducer(state, {
      type: "submitted",
      submittedAt: "2026-03-29 03:52:00"
    });

    expect(nextState.activeStep).toBe(2);
    expect(nextState.submittedAt).toBeNull();
    expect(nextState.showErrors).toBe(true);
  });

  it("stores the submission timestamp when all answers are valid", () => {
    const state = {
      ...createOnboardingFlowState(validAnswers),
      activeStep: reviewStepIndex
    };

    const nextState = onboardingFlowReducer(state, {
      type: "submitted",
      submittedAt: "2026-03-29 03:52:00"
    });

    expect(nextState.activeStep).toBe(reviewStepIndex);
    expect(nextState.submittedAt).toBe("2026-03-29 03:52:00");
    expect(nextState.showErrors).toBe(false);
  });
});

describe("buildReviewSections", () => {
  it("formats answer summaries using questionnaire labels", () => {
    expect(buildReviewSections(validAnswers)).toEqual([
      {
        id: "businessStage",
        label: "Where is the business right now?",
        value: "Launching"
      },
      {
        id: "businessModel",
        label: "Which business model best describes the offer?",
        value: "SaaS product"
      },
      {
        id: "monthlyRevenue",
        label: "What is the current monthly revenue in USD?",
        value: "2500"
      },
      {
        id: "growthGoals",
        label: "What do you need the growth plan to optimize for first?",
        value: "New customer acquisition, Activation"
      },
      {
        id: "channels",
        label: "Which channels are already in play or feel realistic to test?",
        value: "SEO / content, Outbound"
      },
      {
        id: "constraints",
        label: "What constraints or context should the plan respect?",
        value: "Two founders, lean paid budget, one AE."
      }
    ]);
  });
});
