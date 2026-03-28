import { describe, expect, it } from "vitest";
import { createPlanInput, sanitizeAnswers } from "./questionnaire";
import { createGrowthRecommendation } from "./recommendations";

describe("recommendation generation", () => {
  it("creates a structured SaaS recommendation from questionnaire input", () => {
    const payload = createPlanInput(
      sanitizeAnswers({
        businessStage: "launching",
        businessModel: "saas",
        monthlyRevenue: "2500",
        growthGoals: ["acquisition", "activation"],
        channels: ["seo", "outbound"],
        constraints: "Two founders, no full-time marketer, budget under $2k/month."
      })
    );

    const recommendation = createGrowthRecommendation(payload);

    expect(recommendation.profile.stage).toBe("Launching");
    expect(recommendation.profile.model).toBe("SaaS product");
    expect(recommendation.profile.revenueBand).toBe("Early revenue");
    expect(recommendation.bets).toHaveLength(3);
    expect(recommendation.bets[0]?.title).toContain("pipeline");
    expect(recommendation.suggestedTools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining(["Apollo", "HubSpot", "PostHog"])
    );
    expect(recommendation.referenceCompanies.map((company) => company.name)).toContain("Notion");
  });

  it("falls back safely when optional recommendation inputs are sparse", () => {
    const payload = createPlanInput(
      sanitizeAnswers({
        businessStage: "idea",
        businessModel: "consumer",
        monthlyRevenue: "0",
        growthGoals: ["positioning"],
        channels: [],
        constraints: "Solo founder with limited engineering bandwidth."
      })
    );

    const recommendation = createGrowthRecommendation(payload);

    expect(recommendation.profile.revenueBand).toBe("Pre-revenue");
    expect(recommendation.bets[0]?.title).toContain("ICP narrative");
    expect(recommendation.bets[0]?.channels.length).toBeGreaterThan(0);
    expect(recommendation.nextSteps[0]).toContain("seven-day experiment");
  });
});
