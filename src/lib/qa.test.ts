import { describe, expect, it, vi } from "vitest";
import {
  buildQaHref,
  getQaFixtureKey,
  isQaModeEnabled,
  prepareQaMode,
  resolveQaInitialState
} from "./qa";
import { sanitizeAnswers } from "./questionnaire";
import { reviewStepIndex } from "./onboardingFlow";

describe("qa mode helpers", () => {
  it("detects QA mode and fixture selection from the URL", () => {
    expect(isQaModeEnabled("?qa=1")).toBe(true);
    expect(isQaModeEnabled("?fixture=ready")).toBe(false);
    expect(getQaFixtureKey("?qa=1&fixture=ready")).toBe("ready");
    expect(getQaFixtureKey("?qa=1&fixture=unknown")).toBeNull();
  });

  it("prepares answer fixtures through storage helpers", () => {
    const storageOps = {
      clear: vi.fn(),
      save: vi.fn(),
      writeRaw: vi.fn()
    };

    const fixtureKey = prepareQaMode("?qa=1&fixture=resume", storageOps);

    expect(fixtureKey).toBe("resume");
    expect(storageOps.save).toHaveBeenCalledOnce();
    expect(storageOps.clear).not.toHaveBeenCalled();
    expect(storageOps.writeRaw).not.toHaveBeenCalled();
  });

  it("prepares raw recovery fixtures without sanitizing them first", () => {
    const storageOps = {
      clear: vi.fn(),
      save: vi.fn(),
      writeRaw: vi.fn()
    };

    const fixtureKey = prepareQaMode("?qa=1&fixture=malformed-storage", storageOps);

    expect(fixtureKey).toBe("malformed-storage");
    expect(storageOps.writeRaw).toHaveBeenCalledOnce();
    expect(storageOps.clear).not.toHaveBeenCalled();
    expect(storageOps.save).not.toHaveBeenCalled();
  });

  it("resolves deterministic ready and submitted states for QA flows", () => {
    const fallbackAnswers = sanitizeAnswers(null);
    const readyState = resolveQaInitialState("?qa=1&fixture=ready", fallbackAnswers);
    const submittedState = resolveQaInitialState("?qa=1&fixture=submitted", fallbackAnswers);

    expect(readyState?.activeStep).toBe(reviewStepIndex);
    expect(readyState?.submittedAt).toBeNull();
    expect(submittedState?.activeStep).toBe(reviewStepIndex);
    expect(submittedState?.submittedAt).toBe("2026-03-29 11:15 AM");
  });

  it("keeps current storage intact in plain QA mode", () => {
    const fallbackAnswers = sanitizeAnswers({
      businessStage: "launching"
    });

    const state = resolveQaInitialState("?qa=1", fallbackAnswers);

    expect(state?.answers).toEqual(fallbackAnswers);
    expect(state?.activeStep).toBe(0);
    expect(buildQaHref("/growth-plan", "ready")).toBe("/growth-plan?qa=1&fixture=ready");
  });
});
