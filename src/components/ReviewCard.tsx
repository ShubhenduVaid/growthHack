import { RecommendationResults } from "./RecommendationResults";
import type { GrowthRecommendation, PlanInput, ReviewSection } from "../types";

type ReviewCardProps = {
  reviewSections: ReviewSection[];
  submittedAt: string | null;
  recommendation: GrowthRecommendation;
  submissionPayload: PlanInput;
  onBack: () => void;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export const ReviewCard = ({
  reviewSections,
  submittedAt,
  recommendation,
  submissionPayload,
  onBack,
  onEditStep,
  onSubmit,
  onReset
}: ReviewCardProps) => (
  <section className="review-card" data-testid="review-card">
    <div className="review-card__header">
      <p className="review-card__eyebrow">Review</p>
      <h2>Plan input is ready for recommendation generation.</h2>
      <p>Validate the summary, edit anything that looks off, then generate a first-pass growth plan from the structured payload.</p>
    </div>

    <dl className="review-grid">
        {reviewSections.map((section, index) => (
        <div key={section.id} className="review-grid__item" data-testid={`review-${section.id}`}>
          <dt>
            <span>{section.label}</span>
            <button type="button" className="review-grid__edit" onClick={() => onEditStep(index)}>
              Edit
            </button>
          </dt>
          <dd>{section.value || "Not answered yet"}</dd>
        </div>
      ))}
    </dl>

    <div className="workspace__actions">
      <button type="button" className="button button--secondary" onClick={onBack} data-testid="review-back-button">
        Back
      </button>
      <button
        type="button"
        className="button"
        onClick={onSubmit}
        data-testid={submittedAt ? "refresh-recommendations-button" : "submit-recommendations-button"}
      >
        {submittedAt ? "Refresh Recommendations" : "Submit For Recommendations"}
      </button>
    </div>

    {submittedAt ? (
      <>
        <RecommendationResults
          recommendation={recommendation}
          reviewSections={reviewSections}
          submittedAt={submittedAt}
        />
        <div className="start-over">
          <button type="button" className="button button--secondary" onClick={onReset} data-testid="start-over-button">
            Start over with new answers
          </button>
        </div>
      </>
    ) : null}

    <details className="payload-panel" data-testid="payload-panel">
      <summary className="payload-panel__summary">
        <div>
          <p className="payload-panel__eyebrow">{submittedAt ? "Debug payload" : "Structured output"}</p>
          <h3>{submittedAt ? "Inspect the structured handoff" : "Preview the recommendation handoff payload"}</h3>
        </div>
        <span>{submittedAt ? "Hidden by default" : "Optional preview"}</span>
      </summary>
      <pre>{JSON.stringify(submissionPayload, null, 2)}</pre>
      {submittedAt ? (
        <p className="payload-panel__status">Recommendations generated from this payload at {submittedAt}.</p>
      ) : null}
    </details>
  </section>
);
