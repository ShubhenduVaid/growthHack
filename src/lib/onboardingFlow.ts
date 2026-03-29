import { questionnaire } from "../data/questionnaire";
import { getQuestionLabel, validateQuestion } from "./questionnaire";
import type { AnswerValue, QuestionnaireAnswers, ReviewSection } from "../types";

export const reviewStepIndex = questionnaire.length;

export type OnboardingFlowState = {
  answers: QuestionnaireAnswers;
  activeStep: number;
  submittedAt: string | null;
  showErrors: boolean;
};

export type OnboardingFlowAction =
  | {
      type: "answerChanged";
      questionId: string;
      value: AnswerValue;
    }
  | {
      type: "stepSelected";
      step: number;
    }
  | {
      type: "stepBack";
    }
  | {
      type: "stepContinued";
    }
  | {
      type: "submitted";
      submittedAt: string;
    }
  | {
      type: "reset";
    };

const clampStep = (step: number): number => Math.min(Math.max(step, 0), reviewStepIndex);

const getCurrentQuestion = (activeStep: number) => questionnaire[activeStep];

export const createOnboardingFlowState = (
  answers: QuestionnaireAnswers,
  overrides: Partial<Omit<OnboardingFlowState, "answers">> = {}
): OnboardingFlowState => ({
  answers,
  activeStep: clampStep(overrides.activeStep ?? 0),
  submittedAt: overrides.submittedAt ?? null,
  showErrors: overrides.showErrors ?? false
});

export const getFirstInvalidQuestionIndex = (answers: QuestionnaireAnswers): number =>
  questionnaire.findIndex((question) => validateQuestion(question, answers) !== null);

const getFurthestReachableStep = (answers: QuestionnaireAnswers): number => {
  const firstInvalidQuestionIndex = getFirstInvalidQuestionIndex(answers);

  return firstInvalidQuestionIndex >= 0 ? firstInvalidQuestionIndex : reviewStepIndex;
};

export const buildReviewSections = (answers: QuestionnaireAnswers): ReviewSection[] =>
  questionnaire.map((question) => {
    const value = answers[question.id];

    if (question.type === "multi") {
      return {
        id: question.id,
        label: question.prompt,
        value: Array.isArray(value) ? value.map((item) => getQuestionLabel(question.id, item)).join(", ") : ""
      };
    }

    if (question.type === "single") {
      return {
        id: question.id,
        label: question.prompt,
        value: typeof value === "string" ? getQuestionLabel(question.id, value) : ""
      };
    }

    return {
      id: question.id,
      label: question.prompt,
      value: typeof value === "string" ? value : ""
    };
  });

export const onboardingFlowReducer = (
  state: OnboardingFlowState,
  action: OnboardingFlowAction
): OnboardingFlowState => {
  switch (action.type) {
    case "answerChanged":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.value
        },
        showErrors: false
      };
    case "stepSelected":
      if (action.step <= state.activeStep) {
        return {
          ...state,
          activeStep: clampStep(action.step),
          showErrors: false
        };
      }

      const furthestReachableStep = getFurthestReachableStep(state.answers);
      const nextStep = Math.min(clampStep(action.step), furthestReachableStep);

      return {
        ...state,
        activeStep: nextStep,
        showErrors: nextStep !== clampStep(action.step)
      };
    case "stepBack":
      return {
        ...state,
        activeStep: clampStep(state.activeStep - 1),
        showErrors: false
      };
    case "stepContinued": {
      const currentQuestion = getCurrentQuestion(state.activeStep);

      if (!currentQuestion) {
        return state;
      }

      const error = validateQuestion(currentQuestion, state.answers);

      if (error) {
        return {
          ...state,
          showErrors: true
        };
      }

      return {
        ...state,
        activeStep: clampStep(state.activeStep + 1),
        showErrors: false
      };
    }
    case "submitted": {
      const firstInvalidQuestionIndex = getFirstInvalidQuestionIndex(state.answers);

      if (firstInvalidQuestionIndex >= 0) {
        return {
          ...state,
          activeStep: firstInvalidQuestionIndex,
          showErrors: true
        };
      }

      return {
        ...state,
        activeStep: reviewStepIndex,
        submittedAt: action.submittedAt,
        showErrors: false
      };
    }
    case "reset":
      return createOnboardingFlowState({});
  }
};
