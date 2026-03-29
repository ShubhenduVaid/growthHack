import { QuestionCard } from "./QuestionCard";
import type { AnswerValue, Question } from "../types";

type QuestionStepProps = {
  question: Question;
  answer: AnswerValue | undefined;
  error: string | null;
  canGoBack: boolean;
  onBack: () => void;
  onContinue: () => void;
  onChange: (value: AnswerValue) => void;
};

export const QuestionStep = ({
  question,
  answer,
  error,
  canGoBack,
  onBack,
  onContinue,
  onChange
}: QuestionStepProps) => (
  <>
    <QuestionCard question={question} answer={answer} error={error} onChange={onChange} />

    <div className="workspace__actions">
      <button
        type="button"
        className="button button--secondary"
        onClick={onBack}
        disabled={!canGoBack}
        data-testid="back-button"
      >
        Back
      </button>
      <button type="button" className="button" onClick={onContinue} data-testid="continue-button">
        Continue
      </button>
    </div>
  </>
);
