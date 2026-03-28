import type { GrowthRecommendation } from "../types";

type RecommendationResultsProps = {
  recommendation: GrowthRecommendation;
  submittedAt: string;
};

export const RecommendationResults = ({ recommendation, submittedAt }: RecommendationResultsProps) => (
  <section className="results-panel" aria-labelledby="results-title">
    <div className="results-panel__header">
      <div>
        <p className="results-panel__eyebrow">Recommendations</p>
        <h3 id="results-title">First-pass growth thesis</h3>
      </div>
      <p className="results-panel__timestamp">Generated {submittedAt}</p>
    </div>

    <p className="results-panel__summary">{recommendation.summary}</p>
    <p className="results-panel__note">{recommendation.readinessNote}</p>

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

    <div className="results-grid">
      <section className="results-section">
        <h4>Prioritized bets</h4>
        <div className="results-stack">
          {recommendation.bets.map((bet) => (
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
        <h4>Suggested SaaS stack</h4>
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
        <h4>Reference companies</h4>
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

      <section className="results-section">
        <h4>Next actions</h4>
        <ol className="next-steps">
          {recommendation.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  </section>
);
