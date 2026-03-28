import { questionnaire } from "../data/questionnaire";
import type { PlanInput, Question, QuestionnaireAnswers } from "../types";

export const getInitialAnswers = (): QuestionnaireAnswers =>
  Object.fromEntries(questionnaire.map((question) => [question.id, question.type === "multi" ? [] : ""]));

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const getAllowedOptionIds = (question: Question): Set<string> =>
  question.type === "single" || question.type === "multi"
    ? new Set(question.options.map((option) => option.id))
    : new Set<string>();

const sanitizeString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const sanitizeNumberValue = (question: Extract<Question, { type: "number" }>, value: unknown): string => {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const normalizedValue = typeof value === "string" ? value.trim() : String(value);

  if (normalizedValue.length === 0) {
    return "";
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) {
    return "";
  }

  if (question.min !== undefined && parsedValue < question.min) {
    return "";
  }

  if (question.max !== undefined && parsedValue > question.max) {
    return "";
  }

  return String(parsedValue);
};

const sanitizeQuestionAnswer = (question: Question, rawValue: unknown): string | string[] => {
  if (question.type === "multi") {
    if (!isStringArray(rawValue)) {
      return [];
    }

    const allowedIds = getAllowedOptionIds(question);
    return Array.from(new Set(rawValue.map((value) => value.trim()).filter((value) => allowedIds.has(value))));
  }

  if (question.type === "single") {
    const value = sanitizeString(rawValue);
    return getAllowedOptionIds(question).has(value) ? value : "";
  }

  if (question.type === "text") {
    return sanitizeString(rawValue).slice(0, question.maxLength);
  }

  return sanitizeNumberValue(question, rawValue);
};

export const sanitizeAnswers = (input: unknown): QuestionnaireAnswers => {
  const defaults = getInitialAnswers();

  if (!input || typeof input !== "object") {
    return defaults;
  }

  const source = input as Record<string, unknown>;
  const sanitizedEntries = questionnaire.map((question) => {
    const sanitizedValue = sanitizeQuestionAnswer(question, source[question.id]);
    return [question.id, sanitizedValue] as const;
  });

  return Object.fromEntries(sanitizedEntries);
};

export const validateQuestion = (question: Question, answers: QuestionnaireAnswers): string | null => {
  const value = sanitizeQuestionAnswer(question, answers[question.id]);

  if (question.type === "single") {
    return hasText(value) ? null : "Select one option to continue.";
  }

  if (question.type === "multi") {
    if (!isStringArray(value) || value.length < (question.minSelections ?? 1)) {
      return "Select at least one option to continue.";
    }

    return null;
  }

  if (question.type === "text") {
    if (!hasText(value)) {
      return "Add enough context so the plan can stay grounded in reality.";
    }

    return value.trim().length <= question.maxLength ? null : `Keep this under ${question.maxLength} characters.`;
  }

  if (!hasText(value)) {
    return "Enter a monthly revenue number.";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "Revenue must be a valid number.";
  }

  if (question.min !== undefined && numericValue < question.min) {
    return `Revenue must be at least ${question.min}.`;
  }

  if (question.max !== undefined && numericValue > question.max) {
    return `Revenue must be at most ${question.max}.`;
  }

  return null;
};

export const getCompletionCount = (answers: QuestionnaireAnswers): number =>
  questionnaire.filter((question) => validateQuestion(question, answers) === null).length;

export const getQuestionLabel = (questionId: string, value: string): string => {
  const question = questionnaire.find((item) => item.id === questionId);

  if (!question || (question.type !== "single" && question.type !== "multi")) {
    return value;
  }

  return question.options.find((option) => option.id === value)?.label ?? value;
};

export const createPlanInput = (answers: QuestionnaireAnswers): PlanInput => ({
  completedAt: new Date().toISOString(),
  answers: sanitizeAnswers(answers)
});
