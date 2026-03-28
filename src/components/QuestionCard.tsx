import type { Question, QuestionnaireAnswers } from "../types";

type QuestionCardProps = {
  question: Question;
  answer: QuestionnaireAnswers[string];
  error: string | null;
  onChange: (value: string | string[]) => void;
};

export const QuestionCard = ({ question, answer, error, onChange }: QuestionCardProps) => {
  return (
    <section className="question-card" aria-labelledby={`question-${question.id}`}>
      <div className="question-card__eyebrow">
        <span>{question.stepLabel}</span>
        {question.required ? <span className="question-card__required">Required</span> : null}
      </div>

      <div className="question-card__header">
        <h2 id={`question-${question.id}`}>{question.prompt}</h2>
        <p>{question.helpText}</p>
      </div>

      <div className="question-card__body">
        {question.type === "single"
          ? question.options.map((option) => {
              const selected = answer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`choice-card ${selected ? "choice-card--selected" : ""}`}
                  onClick={() => onChange(option.id)}
                >
                  <strong>{option.label}</strong>
                  {option.description ? <span>{option.description}</span> : null}
                </button>
              );
            })
          : null}

        {question.type === "multi"
          ? question.options.map((option) => {
              const values = Array.isArray(answer) ? answer : [];
              const selected = values.includes(option.id);

              return (
                <label key={option.id} className={`choice-card ${selected ? "choice-card--selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {
                      const nextValue = selected
                        ? values.filter((value) => value !== option.id)
                        : [...values, option.id];
                      onChange(nextValue);
                    }}
                  />
                  <span className="choice-card__content">
                    <strong>{option.label}</strong>
                    {option.description ? <span>{option.description}</span> : null}
                  </span>
                </label>
              );
            })
          : null}

        {question.type === "text" ? (
          <label className="field">
            <textarea
              value={typeof answer === "string" ? answer : ""}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              onChange={(event) => onChange(event.target.value)}
              rows={5}
            />
            <span className="field__meta">
              {(typeof answer === "string" ? answer.length : 0).toString()}/{question.maxLength}
            </span>
          </label>
        ) : null}

        {question.type === "number" ? (
          <label className="field">
            <input
              type="number"
              inputMode="numeric"
              placeholder={question.placeholder}
              min={question.min}
              max={question.max}
              value={typeof answer === "string" ? answer : ""}
              onChange={(event) => onChange(event.target.value)}
            />
          </label>
        ) : null}
      </div>

      {error ? (
        <p className="question-card__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
};
