import { describe, expect, it } from "vitest";
import { createPlanInput, sanitizeAnswers } from "./questionnaire";
import { createGrowthRecommendation } from "./recommendations";

const buildRecommendation = (answers: Record<string, unknown>) =>
  createGrowthRecommendation(createPlanInput(sanitizeAnswers(answers)));

const rawChannelIds = new Set(["seo", "outbound", "paid", "community", "partnerships"]);

describe("recommendation generation", () => {
  it("creates a structured SaaS recommendation from questionnaire input", () => {
    const recommendation = buildRecommendation({
      businessStage: "launching",
      businessModel: "saas",
      monthlyRevenue: "2500",
      growthGoals: ["acquisition", "activation"],
      channels: ["seo", "outbound"],
      constraints: "Two founders, no full-time marketer, budget under $2k/month."
    });

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

  it("covers representative stage, goal, revenue, and channel combinations without breaking invariants", () => {
    const cases = [
      {
        name: "growing retention marketplace",
        answers: {
          businessStage: "growing",
          businessModel: "marketplace",
          monthlyRevenue: "9200",
          growthGoals: ["retention"],
          channels: ["partnerships", "community"],
          constraints: "Small ops team, both supply and demand need weekly attention."
        },
        expectedStage: "Growing",
        expectedRevenueBand: "Emerging revenue",
        expectedFirstBetTitle: "Install a simple retention and win-back loop",
        expectedFirstBetChannels: ["Partnerships", "Community / social"],
        expectedFirstBetEffort: "high",
        expectedToolNames: ["Customer.io", "PostHog", "HubSpot", "Crossbeam"],
        expectedReferenceCompany: "Airbnb"
      },
      {
        name: "scaling monetization consumer",
        answers: {
          businessStage: "scaling",
          businessModel: "consumer",
          monthlyRevenue: "50000",
          growthGoals: ["monetization"],
          channels: ["paid", "community"],
          constraints: "Paid spend is available, but payback needs to stay disciplined."
        },
        expectedStage: "Scaling",
        expectedRevenueBand: "Scaled revenue",
        expectedFirstBetTitle: "Test packaging and upgrade triggers around core value",
        expectedFirstBetChannels: ["Paid acquisition"],
        expectedFirstBetEffort: "high",
        expectedToolNames: ["Stripe Billing", "PostHog", "Meta Ads Manager", "Common Room"],
        expectedReferenceCompany: "Duolingo"
      },
      {
        name: "idea positioning services fallback channels",
        answers: {
          businessStage: "idea",
          businessModel: "services",
          monthlyRevenue: "0",
          growthGoals: ["positioning"],
          channels: [],
          constraints: "Solo operator, no paid budget, wants a clearer niche first."
        },
        expectedStage: "Idea stage",
        expectedRevenueBand: "Pre-revenue",
        expectedFirstBetTitle: "Rewrite the ICP narrative around one painful outcome",
        expectedFirstBetChannels: ["Community / social", "SEO / content"],
        expectedFirstBetEffort: "low",
        expectedToolNames: ["Wynter", "Hotjar", "HubSpot", "Common Room"],
        expectedReferenceCompany: "DesignJoy"
      }
    ] as const;

    for (const scenario of cases) {
      const recommendation = buildRecommendation(scenario.answers);

      expect(recommendation.summary.length).toBeGreaterThan(0);
      expect(recommendation.readinessNote.length).toBeGreaterThan(0);
      expect(recommendation.profile.stage).toBe(scenario.expectedStage);
      expect(recommendation.profile.revenueBand).toBe(scenario.expectedRevenueBand);
      expect(recommendation.bets.length).toBeGreaterThan(0);
      expect(recommendation.bets.length).toBeLessThanOrEqual(3);
      expect(recommendation.suggestedTools.length).toBeGreaterThan(0);
      expect(recommendation.suggestedTools.length).toBeLessThanOrEqual(4);
      expect(recommendation.nextSteps).toHaveLength(4);
      expect(recommendation.referenceCompanies).toHaveLength(3);
      expect(recommendation.referenceCompanies.map((company) => company.name)).toContain(scenario.expectedReferenceCompany);
      expect(recommendation.bets[0]?.title, scenario.name).toBe(scenario.expectedFirstBetTitle);
      expect(recommendation.bets[0]?.channels, scenario.name).toEqual(scenario.expectedFirstBetChannels);
      expect(recommendation.bets[0]?.effort, scenario.name).toBe(scenario.expectedFirstBetEffort);
      expect(recommendation.suggestedTools.map((tool) => tool.name), scenario.name).toEqual(scenario.expectedToolNames);

      for (const bet of recommendation.bets) {
        expect(bet.title.length, `${scenario.name} title`).toBeGreaterThan(0);
        expect(bet.rationale.length, `${scenario.name} rationale`).toBeGreaterThan(0);
        expect(bet.channels.length, `${scenario.name} channels`).toBeGreaterThan(0);
        expect(bet.channels.length, `${scenario.name} channels`).toBeLessThanOrEqual(2);
        expect(bet.channels.some((channel) => rawChannelIds.has(channel)), `${scenario.name} readable channels`).toBe(false);
      }
    }
  });

  it("falls back safely when optional recommendation inputs are sparse", () => {
    const recommendation = buildRecommendation({
      businessStage: "idea",
      businessModel: "consumer",
      monthlyRevenue: "0",
      growthGoals: ["positioning"],
      channels: [],
      constraints: "Solo founder with limited engineering bandwidth."
    });

    expect(recommendation.profile.revenueBand).toBe("Pre-revenue");
    expect(recommendation.bets[0]?.title).toContain("ICP narrative");
    expect(recommendation.bets[0]?.channels.length).toBeGreaterThan(0);
    expect(recommendation.nextSteps[0]).toContain("seven-day experiment");
  });

  it("defaults invalid or missing inputs to readable bounded recommendations", () => {
    const recommendation = buildRecommendation({
      businessStage: "invalid-stage",
      businessModel: "unknown-model",
      monthlyRevenue: "not-a-number",
      growthGoals: ["bad-goal"],
      channels: ["bad-channel"],
      constraints: ""
    });

    expect(recommendation.profile.stage).toBe("Launching");
    expect(recommendation.profile.model).toBe("SaaS product");
    expect(recommendation.profile.revenueBand).toBe("Pre-revenue");
    expect(recommendation.summary).toContain("new customer acquisition");
    expect(recommendation.bets).toHaveLength(2);
    expect(recommendation.bets[0]?.title).toContain("pipeline");
    expect(recommendation.bets[0]?.channels).toEqual(["Outbound", "SEO / content"]);
    expect(recommendation.bets[1]?.channels).toEqual(["Outbound", "SEO / content"]);
    expect(recommendation.suggestedTools.map((tool) => tool.name)).toEqual(["Apollo", "HubSpot", "PostHog", "Clay"]);
    expect(recommendation.nextSteps[2]).toContain("No extra constraints were provided.");
  });

  it("caps bets and tools when multiple goals and channels are selected", () => {
    const recommendation = buildRecommendation({
      businessStage: "launching",
      businessModel: "saas",
      monthlyRevenue: "15000",
      growthGoals: ["acquisition", "activation", "retention", "monetization"],
      channels: ["seo", "outbound", "paid", "community", "partnerships"],
      constraints: "Lean GTM team with only one active experiment slot per week."
    });

    expect(recommendation.bets).toHaveLength(3);
    expect(recommendation.suggestedTools).toHaveLength(4);
    expect(recommendation.nextSteps).toHaveLength(4);
    expect(recommendation.bets.map((bet) => bet.title)).toEqual([
      "Stand up one repeatable seo / content pipeline",
      "Shorten time-to-value inside the first session",
      "Install a simple retention and win-back loop"
    ]);
  });
});
