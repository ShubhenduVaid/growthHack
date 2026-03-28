import { sanitizeAnswers } from "./questionnaire";
import type { QuestionnaireAnswers } from "../types";

const storageKey = "growth-plan-mvp/answers";

export const loadAnswers = (): QuestionnaireAnswers => {
  if (typeof window === "undefined") {
    return sanitizeAnswers(null);
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? sanitizeAnswers(JSON.parse(rawValue)) : sanitizeAnswers(null);
  } catch {
    return sanitizeAnswers(null);
  }
};

export const saveAnswers = (answers: QuestionnaireAnswers): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(sanitizeAnswers(answers)));
};
