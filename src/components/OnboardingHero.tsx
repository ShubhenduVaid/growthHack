import { questionnaire } from "../data/questionnaire";

type OnboardingHeroProps = {
  activeStep: number;
  completionCount: number;
  progressValue: number;
  reviewStepIndex: number;
  onStepSelect: (step: number) => void;
};

export const OnboardingHero = ({
  activeStep,
  completionCount,
  progressValue,
  reviewStepIndex,
  onStepSelect
}: OnboardingHeroProps) => {
  const activeQuestion = questionnaire[activeStep];
  const activeLabel = activeQuestion ? activeQuestion.stepLabel : "Review";

  return (
    <section className="hero">
      <div className="hero__copy">
        <p className="hero__eyebrow">Guided beta for founder-led SaaS</p>
        <h1>Find the next growth move for your SaaS in one short brief.</h1>
        <p className="hero__body">
          Share your stage, revenue, goals, channels, and real constraints. Paperclip returns one focused first-pass
          recommendation, why it fits, and the assumptions to pressure-test before you invest more budget or time.
        </p>

        <ul className="hero__highlights" aria-label="What happens in this flow">
          <li>Built for teams that need one credible next move, not a long generic strategy deck.</li>
          <li>Your answers stay visible through review and results so the recommendation stays grounded.</li>
          <li>Expect one primary bet, practical next actions, and clear scope on what this plan does not claim.</li>
        </ul>
      </div>

      <aside className="hero__panel">
        <p className="hero__panel-note">
          Start with the active question. The goal is a credible next experiment, not a complete growth strategy.
        </p>
        <div className="hero__compact">
          <div>
            <span className="hero__compact-label">Current step</span>
            <strong>{activeLabel}</strong>
          </div>
          <p>{completionCount} of {questionnaire.length} required answers complete</p>
        </div>

        <div className="hero__metric">
          <span>Progress</span>
          <strong>{progressValue}%</strong>
        </div>
        <progress max={100} value={progressValue} aria-label="Questionnaire completion" />
        <ul className="hero__steps">
          {questionnaire.map((question, index) => (
            <li key={question.id} className={index === activeStep ? "is-active" : ""}>
              <button
                type="button"
                onClick={() => onStepSelect(index)}
                data-testid={`step-nav-${question.id}`}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{question.stepLabel}</strong>
                  <small>{question.prompt}</small>
                </div>
              </button>
            </li>
          ))}
          <li className={activeStep === reviewStepIndex ? "is-active" : ""}>
            <button type="button" onClick={() => onStepSelect(reviewStepIndex)} data-testid="step-nav-review">
              <span>{questionnaire.length + 1}</span>
              <div>
                <strong>Review</strong>
                <small>Confirm answers and generate recommendations</small>
              </div>
            </button>
          </li>
        </ul>
      </aside>
    </section>
  );
};
