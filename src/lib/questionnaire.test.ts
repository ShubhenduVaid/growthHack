import { describe, expect, it } from "vitest";
import { questionnaire } from "../data/questionnaire";
import { createPlanInput, getCompletionCount, sanitizeAnswers, validateQuestion } from "./questionnaire";

describe("questionnaire helpers", () => {
  it("returns a safe default shape for missing answer state", () => {
    expect(sanitizeAnswers(null)).toEqual({
      businessStage: "",
      businessModel: "",
      monthlyRevenue: "",
      growthGoals: [],
      channels: [],
      constraints: ""
    });
  });

  it("sanitizes persisted answers into a safe shape", () => {
    expect(
      sanitizeAnswers({
        businessStage: " launching ",
        businessModel: "invalid-model",
        monthlyRevenue: -20,
        growthGoals: ["activation", "invalid", "activation"],
        channels: ["seo", "seo", "community", "invalid"],
        constraints: 42
      })
    ).toEqual({
      businessStage: "launching",
      businessModel: "",
      monthlyRevenue: "",
      growthGoals: ["activation"],
      channels: ["seo", "community"],
      constraints: ""
    });
  });

  it("normalizes valid numeric and text answers from persisted state", () => {
    expect(
      sanitizeAnswers({
        monthlyRevenue: " 2500 ",
        constraints: "  Team of two with a strict paid budget cap.  "
      })
    ).toEqual({
      businessStage: "",
      businessModel: "",
      monthlyRevenue: "2500",
      growthGoals: [],
      channels: [],
      constraints: "Team of two with a strict paid budget cap."
    });
  });

  it("requires answers before a question is considered complete", () => {
    const answers = sanitizeAnswers({
      businessStage: "launching",
      businessModel: "saas",
      monthlyRevenue: "1200",
      growthGoals: ["activation"],
      channels: ["seo"],
      constraints: "Small team, low paid budget."
    });

    expect(questionnaire.every((question) => validateQuestion(question, answers) === null)).toBe(true);
    expect(getCompletionCount(answers)).toBe(questionnaire.length);
  });

  it("enforces numeric bounds and multi-select minimums during validation", () => {
    const invalidAnswers = sanitizeAnswers({
      businessStage: "launching",
      businessModel: "saas",
      monthlyRevenue: "-1",
      growthGoals: ["invalid"],
      channels: [],
      constraints: "Lean team."
    });

    expect(validateQuestion(questionnaire[2], invalidAnswers)).toBe("Enter a monthly revenue number.");
    expect(validateQuestion(questionnaire[3], invalidAnswers)).toBe("Select at least one option to continue.");
    expect(validateQuestion(questionnaire[4], invalidAnswers)).toBe("Select at least one option to continue.");
  });

  it("creates a sanitized recommendation handoff payload", () => {
    const payload = createPlanInput({
      businessStage: "growing",
      businessModel: "saas",
      monthlyRevenue: " 1200 ",
      growthGoals: ["activation", "activation", "invalid"],
      channels: ["seo", "invalid"],
      constraints: "  Small team, low paid budget.  ",
      unknownField: "should not leak"
    });

    expect(payload.answers).toEqual({
      businessStage: "growing",
      businessModel: "saas",
      monthlyRevenue: "1200",
      growthGoals: ["activation"],
      channels: ["seo"],
      constraints: "Small team, low paid budget."
    });
    expect(typeof payload.completedAt).toBe("string");
  });
});
