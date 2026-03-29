import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OnboardingHero } from "./OnboardingHero";
import { RecommendationResults } from "./RecommendationResults";
import type { GrowthRecommendation, ReviewSection } from "../types";

const reviewSections: ReviewSection[] = [
  { id: "businessStage", label: "Stage", value: "Launching" },
  { id: "businessModel", label: "Model", value: "SaaS product" },
  { id: "growthGoals", label: "Goals", value: "New customer acquisition, activation" },
  { id: "channels", label: "Channels", value: "Outbound, SEO / content" },
  { id: "constraints", label: "Constraints", value: "Two founders, no full-time marketer, budget under $2k per month." }
];

const recommendation: GrowthRecommendation = {
  summary: "Launching SaaS product with early revenue should focus on new customer acquisition before adding more channels.",
  readinessNote: "You need a controlled acquisition engine and tighter activation rather than more surface area.",
  profile: {
    stage: "Launching",
    model: "SaaS product",
    revenueBand: "Early revenue",
    primaryMotion: "Repeatable early traction"
  },
  bets: [
    {
      title: "Stand up one repeatable outbound pipeline",
      rationale: "Focus on a single weekly experiment loop instead of spreading effort across too many channels.",
      channels: ["Outbound", "SEO / content"],
      effort: "medium",
      horizon: "14-30 days"
    },
    {
      title: "Shorten time-to-value inside the first session",
      rationale: "Activation improves the return on every demand source you invest in.",
      channels: ["SEO / content"],
      effort: "medium",
      horizon: "7-21 days"
    }
  ],
  suggestedTools: [
    { name: "Apollo", category: "Outbound prospecting", reason: "Build a tight target list for founder-led outreach." }
  ],
  referenceCompanies: [
    { name: "Linear", reason: "Disciplined product storytelling and strong positioning." }
  ],
  nextSteps: [
    "Turn the first bet into a seven-day experiment brief with one owner, one metric, and one stop/go threshold.",
    "Instrument the funnel with a lightweight scorecard for acquisition and activation.",
    "Keep constraints visible during weekly planning.",
    "Review the first signals after 14 days and either double down or replace the bet."
  ]
};

describe("design messaging", () => {
  it("frames the onboarding hero around a narrow SaaS-first outcome", () => {
    const html = renderToStaticMarkup(
      createElement(OnboardingHero, {
        activeStep: 0,
        completionCount: 1,
        progressValue: 17,
        reviewStepIndex: 6,
        onStepSelect: () => {}
      })
    );

    expect(html).toContain("Guided beta for founder-led SaaS");
    expect(html).toContain("Find the next growth move for your SaaS in one short brief.");
    expect(html).toContain("first-pass recommendation");
    expect(html).not.toContain("Answer six focused questions and leave with a first growth thesis worth testing.");
  });

  it("leads results with fit reasoning and assumptions before optional supporting sections", () => {
    const html = renderToStaticMarkup(
      createElement(RecommendationResults, {
        recommendation,
        reviewSections,
        submittedAt: "2026-03-29 11:15 AM"
      })
    );

    const whyIndex = html.indexOf("Why this fits your answers");
    const assumptionsIndex = html.indexOf("Assumptions to validate this week");
    const toolsIndex = html.indexOf("Optional tools");
    const referencesIndex = html.indexOf("Reference motions");

    expect(html).toContain("This is a first-pass plan shaped by your answers.");
    expect(whyIndex).toBeGreaterThan(-1);
    expect(assumptionsIndex).toBeGreaterThan(whyIndex);
    expect(toolsIndex).toBeGreaterThan(assumptionsIndex);
    expect(referencesIndex).toBeGreaterThan(toolsIndex);
  });
});
