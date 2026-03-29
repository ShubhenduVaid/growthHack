export type QuestionOption = {
  id: string;
  label: string;
  description?: string;
};

export type QuestionBase = {
  id: string;
  prompt: string;
  helpText: string;
  stepLabel: string;
  required?: boolean;
};

export type SingleSelectQuestion = QuestionBase & {
  type: "single";
  options: QuestionOption[];
};

export type MultiSelectQuestion = QuestionBase & {
  type: "multi";
  options: QuestionOption[];
  minSelections?: number;
};

export type TextQuestion = QuestionBase & {
  type: "text";
  placeholder: string;
  maxLength: number;
};

export type NumberQuestion = QuestionBase & {
  type: "number";
  placeholder: string;
  min?: number;
  max?: number;
};

export type Question =
  | SingleSelectQuestion
  | MultiSelectQuestion
  | TextQuestion
  | NumberQuestion;

export type AnswerValue = string | string[];

export type QuestionnaireAnswers = Record<string, AnswerValue | undefined>;

export type PlanInput = {
  completedAt: string;
  answers: QuestionnaireAnswers;
};

export type RecommendationEffort = "low" | "medium" | "high";

export type ReviewSection = {
  id: string;
  label: string;
  value: string;
};

export type GrowthBet = {
  title: string;
  rationale: string;
  channels: string[];
  effort: RecommendationEffort;
  horizon: string;
};

export type SuggestedTool = {
  name: string;
  category: string;
  reason: string;
};

export type ReferenceCompany = {
  name: string;
  reason: string;
};

export type GrowthRecommendation = {
  summary: string;
  readinessNote: string;
  profile: {
    stage: string;
    model: string;
    revenueBand: string;
    primaryMotion: string;
  };
  bets: GrowthBet[];
  suggestedTools: SuggestedTool[];
  referenceCompanies: ReferenceCompany[];
  nextSteps: string[];
};
