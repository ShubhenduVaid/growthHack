import { useEffect, useMemo, useState } from "react";
import { questionnaire } from "./data/questionnaire";
import { QuestionCard } from "./components/QuestionCard";
import { RecommendationResults } from "./components/RecommendationResults";
import { createPlanInput, getCompletionCount, getQuestionLabel, validateQuestion } from "./lib/questionnaire";
import { createGrowthRecommendation } from "./lib/recommendations";
import { loadAnswers, saveAnswers } from "./lib/storage";
import type { QuestionnaireAnswers } from "./types";

const reviewStepIndex = questionnaire.length;

const App = () => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => loadAnswers());
  const [activeStep, setActiveStep] = useState(0);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    saveAnswers(answers);
  }, [answers]);

  const completionCount = getCompletionCount(answers);
  const progressValue = Math.round((completionCount / questionnaire.length) * 100);
  const currentQuestion = questionnaire[activeStep];
  const currentError = currentQuestion ? validateQuestion(currentQuestion, answers) : null;

  const reviewSections = useMemo(
    () =>
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
      }),
    [answers]
  );

  const submissionPayload = useMemo(() => createPlanInput(answers), [answers]);
  const recommendation = useMemo(() => createGrowthRecommendation(submissionPayload), [submissionPayload]);

  const handleChange = (questionId: string, value: string | string[]) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value
    }));
    setShowErrors(false);
  };

  const handleNext = () => {
    if (!currentQuestion) {
      return;
    }

    const error = validateQuestion(currentQuestion, answers);

    if (error) {
      setShowErrors(true);
      return;
    }

    setActiveStep((current) => Math.min(current + 1, reviewStepIndex));
    setShowErrors(false);
  };

  const handleSubmit = () => {
    const firstInvalidIndex = questionnaire.findIndex((question) => validateQuestion(question, answers) !== null);

    if (firstInvalidIndex >= 0) {
      setActiveStep(firstInvalidIndex);
      setShowErrors(true);
      return;
    }

    setSubmittedAt(new Date().toLocaleString());
  };

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__eyebrow">Growth Plan MVP</p>
          <h1>Capture the inputs that make growth advice specific instead of generic.</h1>
          <p className="hero__body">
            This first slice structures the answers the recommendation engine will need next: business stage,
            goals, realistic channels, and operating constraints.
          </p>
        </div>

        <aside className="hero__panel">
          <div className="hero__metric">
            <span>Progress</span>
            <strong>{progressValue}%</strong>
          </div>
          <progress max={100} value={progressValue} aria-label="Questionnaire completion" />
          <ul className="hero__steps">
            {questionnaire.map((question, index) => (
              <li key={question.id} className={index === activeStep ? "is-active" : ""}>
                <button type="button" onClick={() => setActiveStep(index)}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{question.stepLabel}</strong>
                    <small>{question.prompt}</small>
                  </div>
                </button>
              </li>
            ))}
            <li className={activeStep === reviewStepIndex ? "is-active" : ""}>
              <button type="button" onClick={() => setActiveStep(reviewStepIndex)}>
                <span>{questionnaire.length + 1}</span>
                <div>
                  <strong>Review</strong>
                  <small>Ready the payload for recommendations</small>
                </div>
              </button>
            </li>
          </ul>
        </aside>
      </section>

      <section className="workspace">
        {currentQuestion ? (
          <>
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              error={showErrors ? currentError : null}
              onChange={(value) => handleChange(currentQuestion.id, value)}
            />

            <div className="workspace__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
                disabled={activeStep === 0}
              >
                Back
              </button>
              <button type="button" className="button" onClick={handleNext}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <section className="review-card">
            <div className="review-card__header">
              <p className="review-card__eyebrow">Review</p>
              <h2>Plan input is ready for recommendation generation.</h2>
              <p>Validate the summary, then generate a first-pass growth plan from the structured payload.</p>
            </div>

            <dl className="review-grid">
              {reviewSections.map((section) => (
                <div key={section.id} className="review-grid__item">
                  <dt>{section.label}</dt>
                  <dd>{section.value || "Not answered yet"}</dd>
                </div>
              ))}
            </dl>

            <div className="workspace__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setActiveStep(reviewStepIndex - 1)}
              >
                Back
              </button>
              <button type="button" className="button" onClick={handleSubmit}>
                {submittedAt ? "Refresh Recommendations" : "Submit For Recommendations"}
              </button>
            </div>

            {submittedAt ? <RecommendationResults recommendation={recommendation} submittedAt={submittedAt} /> : null}

            <div className="payload-panel">
              <div>
                <p className="payload-panel__eyebrow">{submittedAt ? "Debug payload" : "Structured output"}</p>
                <h3>{submittedAt ? "Generated from this handoff" : "Recommendation handoff payload"}</h3>
              </div>
              <pre>{JSON.stringify(submissionPayload, null, 2)}</pre>
              {submittedAt ? (
                <p className="payload-panel__status">Recommendations generated from this payload at {submittedAt}.</p>
              ) : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default App;
