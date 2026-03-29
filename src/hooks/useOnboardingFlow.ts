import { useEffect, useMemo, useReducer } from "react";
import { questionnaire } from "../data/questionnaire";
import { createPlanInput, getCompletionCount, validateQuestion } from "../lib/questionnaire";
import { getQaFixtureKey, isQaModeEnabled, resolveQaInitialState } from "../lib/qa";
import { createGrowthRecommendation } from "../lib/recommendations";
import { loadAnswers, saveAnswers } from "../lib/storage";
import {
  buildReviewSections,
  createOnboardingFlowState,
  onboardingFlowReducer,
  reviewStepIndex
} from "../lib/onboardingFlow";
import type { AnswerValue } from "../types";

export const useOnboardingFlow = () => {
  const qaSearch = typeof window === "undefined" ? "" : window.location.search;
  const qaMode = isQaModeEnabled(qaSearch);
  const qaFixtureKey = getQaFixtureKey(qaSearch);
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;

  const [state, dispatch] = useReducer(onboardingFlowReducer, undefined, () => {
    const storedAnswers = loadAnswers();
    return resolveQaInitialState(qaSearch, storedAnswers) ?? createOnboardingFlowState(storedAnswers);
  });

  useEffect(() => {
    saveAnswers(state.answers);
  }, [state.answers]);

  const completionCount = getCompletionCount(state.answers);
  const progressValue = Math.round((completionCount / questionnaire.length) * 100);
  const currentQuestion = questionnaire[state.activeStep];
  const currentError = currentQuestion ? validateQuestion(currentQuestion, state.answers) : null;

  const reviewSections = useMemo(() => buildReviewSections(state.answers), [state.answers]);
  const submissionPayload = useMemo(() => createPlanInput(state.answers), [state.answers]);
  const recommendation = useMemo(() => createGrowthRecommendation(submissionPayload), [submissionPayload]);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    dispatch({
      type: "answerChanged",
      questionId,
      value
    });
  };

  const goToStep = (step: number) => {
    dispatch({
      type: "stepSelected",
      step
    });
  };

  const goBack = () => {
    dispatch({ type: "stepBack" });
  };

  const continueStep = () => {
    dispatch({ type: "stepContinued" });
  };

  const submit = () => {
    dispatch({
      type: "submitted",
      submittedAt: new Date().toLocaleString()
    });
  };

  return {
    ...state,
    qaMode,
    qaFixtureKey,
    pathname,
    reviewStepIndex,
    completionCount,
    progressValue,
    currentQuestion,
    currentError,
    reviewSections,
    submissionPayload,
    recommendation,
    setAnswer,
    goToStep,
    goBack,
    continueStep,
    submit
  };
};
