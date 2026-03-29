import type { GrowthRecommendation, ReviewSection } from "../types";

type RecommendationResultsProps = {
  recommendation: GrowthRecommendation;
  reviewSections: ReviewSection[];
  submittedAt: string;
};

const getReviewValue = (reviewSections: ReviewSection[], id: string): string =>
  reviewSections.find((section) => section.id === id)?.value || "Not provided";

const buildFitReasons = (reviewSections: ReviewSection[], motion: string): string[] => [
  `${getReviewValue(reviewSections, "businessStage")} stage means the plan should optimize for ${motion.toLowerCase()}.`,
  `Primary goals selected: ${getReviewValue(reviewSections, "growthGoals")}.`,
  `Chosen channels keep the recommendation grounded in: ${getReviewValue(reviewSections, "channels")}.`
];

const buildExecutionNote = (reviewSections: ReviewSection[], effort: string): string =>
  `${effort[0]?.toUpperCase()}${effort.slice(1)} effort is appropriate only if the team can execute within this reality: ${getReviewValue(reviewSections, "constraints")}.`;

const buildAssumptions = (reviewSections: ReviewSection[], recommendation: GrowthRecommendation): string[] => [
  `This recommendation stays narrow on purpose. It assumes ${getReviewValue(reviewSections, "channels").toLowerCase()} are still the most realistic channels to push next.`,
  `Execution needs to fit this operating reality: ${getReviewValue(reviewSections, "constraints")}.`,
  `Treat this as a first-pass plan for a ${recommendation.profile.stage.toLowerCase()} ${recommendation.profile.model.toLowerCase()}, then adjust once live signal proves or disproves the bet.`
];

export const RecommendationResults = ({
  recommendation,
  reviewSections,
  submittedAt
}: RecommendationResultsProps) => {
  const primaryBet = recommendation.bets[0];
  const supportingBets = recommendation.bets.slice(1);
  const fitReasons = buildFitReasons(reviewSections, recommendation.profile.primaryMotion);
  const assumptions = buildAssumptions(reviewSections, recommendation);

  return (
    <section className="results-panel" aria-labelledby="results-title" data-testid="recommendation-results">
      <div className="results-panel__header">
        <div>
          <p className="results-panel__eyebrow">Focused recommendation</p>
          <h3 id="results-title">Your next growth move</h3>
        </div>
        <p className="results-panel__timestamp">Generated {submittedAt}</p>
      </div>

      <p className="results-panel__summary">{recommendation.summary}</p>
      <div className="results-panel__trust">
        <p className="results-panel__trust-title">This is a first-pass plan shaped by your answers.</p>
        <p className="results-panel__note">{recommendation.readinessNote}</p>
      </div>

      <div className="results-profile">
        <div>
          <span>Stage</span>
          <strong>{recommendation.profile.stage}</strong>
        </div>
        <div>
          <span>Model</span>
          <strong>{recommendation.profile.model}</strong>
        </div>
        <div>
          <span>Revenue</span>
          <strong>{recommendation.profile.revenueBand}</strong>
        </div>
        <div>
          <span>Motion</span>
          <strong>{recommendation.profile.primaryMotion}</strong>
        </div>
      </div>

      {primaryBet ? (
        <section className="featured-bet" aria-labelledby="featured-bet-title">
          <div className="featured-bet__intro">
            <div>
              <p className="featured-bet__eyebrow">Primary recommendation</p>
              <h4 id="featured-bet-title">{primaryBet.title}</h4>
            </div>
            <div className="featured-bet__badges">
              <span>{primaryBet.effort} effort</span>
              <span>{primaryBet.horizon}</span>
            </div>
          </div>

          <p className="featured-bet__summary">{primaryBet.rationale}</p>
          <p className="featured-bet__trust">
            Use this as the next experiment to validate, not a final long-range strategy.
          </p>

          <div className="featured-bet__grid">
            <section className="featured-bet__section">
              <h5>Why this fits your answers</h5>
              <ul>
                {fitReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>

            <section className="featured-bet__section">
              <h5>Assumptions to validate this week</h5>
              <ul>
                {assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </section>

            <section className="featured-bet__section">
              <h5>First actions</h5>
              <p>{buildExecutionNote(reviewSections, primaryBet.effort)}</p>
              <p className="featured-bet__channels">Channels to prioritize: {primaryBet.channels.join(" + ")}</p>
              <ol className="next-steps">
                {recommendation.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        </section>
      ) : null}

      <div className="results-grid">
        <section className="results-section">
          <h4>{supportingBets.length > 0 ? "Supporting bets" : "Recommendation details"}</h4>
          <div className="results-stack">
            {(supportingBets.length > 0 ? supportingBets : recommendation.bets).map((bet) => (
              <article key={bet.title} className="result-card">
                <div className="result-card__header">
                  <h5>{bet.title}</h5>
                  <span>{bet.effort} effort</span>
                </div>
                <p>{bet.rationale}</p>
                <div className="result-card__meta">
                  <strong>{bet.horizon}</strong>
                  <span>{bet.channels.join(" + ")}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="results-section">
          <h4>Optional tools</h4>
          <div className="results-stack">
            {recommendation.suggestedTools.map((tool) => (
              <article key={tool.name} className="result-card result-card--compact">
                <div className="result-card__header">
                  <h5>{tool.name}</h5>
                  <span>{tool.category}</span>
                </div>
                <p>{tool.reason}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="results-section">
          <h4>Reference motions</h4>
          <div className="results-stack">
            {recommendation.referenceCompanies.map((company) => (
              <article key={company.name} className="result-card result-card--compact">
                <div className="result-card__header">
                  <h5>{company.name}</h5>
                </div>
                <p>{company.reason}</p>
              </article>
            ))}
          </div>
        </section>

      </div>
    </section>
  );
};
