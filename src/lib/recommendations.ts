import type { GrowthBet, GrowthRecommendation, PlanInput, ReferenceCompany, SuggestedTool } from "../types";
import { getQuestionLabel } from "./questionnaire";

type StageId = "idea" | "launching" | "growing" | "scaling";
type ModelId = "saas" | "services" | "marketplace" | "consumer";
type GoalId = "acquisition" | "activation" | "retention" | "monetization" | "positioning";
type ChannelId = "seo" | "outbound" | "paid" | "community" | "partnerships";

type RecommendationContext = {
  stage: StageId;
  stageLabel: string;
  model: ModelId;
  modelLabel: string;
  revenue: number;
  revenueBand: string;
  goals: GoalId[];
  goalLabels: string[];
  primaryGoal: GoalId;
  channels: ChannelId[];
  channelLabels: string[];
  constraints: string;
};

const stageDefaults: Record<StageId, { note: string; motion: string; nextStep: string }> = {
  idea: {
    note: "Keep the plan narrow. The priority is proving repeatable demand before trying to scale spend.",
    motion: "Speed of learning",
    nextStep: "Run five founder interviews or demos against one ICP segment before widening channel tests."
  },
  launching: {
    note: "You need a controlled acquisition engine and tighter activation rather than more surface area.",
    motion: "Repeatable early traction",
    nextStep: "Set a weekly operating cadence with one acquisition metric and one activation metric."
  },
  growing: {
    note: "The product has signal. Focus on sharpening the best channel and removing conversion friction.",
    motion: "Channel leverage",
    nextStep: "Choose one primary channel owner and instrument the funnel end to end."
  },
  scaling: {
    note: "Protect efficiency while expanding. Systemize the channel mix and retention loops.",
    motion: "Operational leverage",
    nextStep: "Review CAC payback, retention by cohort, and channel contribution in one weekly scorecard."
  }
};

const modelReferenceCompanies: Record<ModelId, ReferenceCompany[]> = {
  saas: [
    { name: "Notion", reason: "Strong template-led distribution and product-led expansion." },
    { name: "Linear", reason: "Tight positioning and disciplined founder-led product storytelling." },
    { name: "Canva", reason: "Simple activation path with team expansion loops." }
  ],
  services: [
    { name: "DesignJoy", reason: "Clear offer packaging and strong point-of-view marketing." },
    { name: "Refine Labs", reason: "Audience-led demand creation tied directly to services credibility." },
    { name: "Clay", reason: "High-trust brand building around expertise and bespoke outcomes." }
  ],
  marketplace: [
    { name: "Airbnb", reason: "Supply-first density strategy and trust-building mechanics." },
    { name: "Faire", reason: "Strong supply-demand matching with clear category focus." },
    { name: "Upwork", reason: "Marketplace liquidity and trust signals across both sides." }
  ],
  consumer: [
    { name: "Duolingo", reason: "Habit loops, strong retention design, and broad top-of-funnel reach." },
    { name: "Strava", reason: "Community and identity mechanics that fuel repeat usage." },
    { name: "Dropbox", reason: "Classic referral motion tied to product value." }
  ]
};

const toolCatalog: Record<string, SuggestedTool> = {
  posthog: {
    name: "PostHog",
    category: "Product analytics",
    reason: "Track activation, funnel drop-off, and experiment impact without a heavy setup."
  },
  hubspot: {
    name: "HubSpot",
    category: "CRM",
    reason: "Useful when leads, lifecycle stages, and handoffs need one operational system."
  },
  ahrefs: {
    name: "Ahrefs",
    category: "SEO research",
    reason: "Prioritize content gaps, ranking opportunities, and competitor coverage."
  },
  apollo: {
    name: "Apollo",
    category: "Outbound prospecting",
    reason: "Build target account lists and founder-led outbound sequences quickly."
  },
  clay: {
    name: "Clay",
    category: "Prospect enrichment",
    reason: "Enrich outbound or partnership targets so messaging can stay specific."
  },
  customerio: {
    name: "Customer.io",
    category: "Lifecycle messaging",
    reason: "Useful for activation nudges, win-back campaigns, and retention sequences."
  },
  hotjar: {
    name: "Hotjar",
    category: "UX research",
    reason: "Shows where onboarding friction and conversion confusion actually happen."
  },
  stripe: {
    name: "Stripe Billing",
    category: "Monetization",
    reason: "Good baseline for pricing tests, packaging changes, and upgrade instrumentation."
  },
  metaads: {
    name: "Meta Ads Manager",
    category: "Paid acquisition",
    reason: "Fast channel for creative testing when the offer is already clear."
  },
  crossbeam: {
    name: "Crossbeam",
    category: "Partnerships",
    reason: "Helps identify overlap with partners and turn integrations into pipeline."
  },
  commonroom: {
    name: "Common Room",
    category: "Community signal",
    reason: "Useful when social proof, community activity, and warm demand need one view."
  },
  wynter: {
    name: "Wynter",
    category: "Message testing",
    reason: "Quick way to pressure-test positioning before scaling campaigns."
  }
};

const goalToolMap: Record<GoalId, Array<keyof typeof toolCatalog>> = {
  acquisition: ["apollo", "hubspot"],
  activation: ["posthog", "hotjar"],
  retention: ["customerio", "posthog"],
  monetization: ["stripe", "posthog"],
  positioning: ["wynter", "hotjar"]
};

const channelToolMap: Record<ChannelId, Array<keyof typeof toolCatalog>> = {
  seo: ["ahrefs"],
  outbound: ["apollo", "clay"],
  paid: ["metaads"],
  community: ["commonroom"],
  partnerships: ["crossbeam"]
};

const goalChannelDefaults: Record<GoalId, ChannelId[]> = {
  acquisition: ["outbound", "seo", "paid"],
  activation: ["seo", "paid", "community"],
  retention: ["community", "partnerships", "seo"],
  monetization: ["paid", "outbound", "seo"],
  positioning: ["community", "seo", "outbound"]
};

const hasValue = <T extends string>(value: string, allowed: readonly T[]): value is T =>
  allowed.includes(value as T);

const stageValues = ["idea", "launching", "growing", "scaling"] as const;
const modelValues = ["saas", "services", "marketplace", "consumer"] as const;
const goalValues = ["acquisition", "activation", "retention", "monetization", "positioning"] as const;
const channelValues = ["seo", "outbound", "paid", "community", "partnerships"] as const;

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

const getRevenueBand = (revenue: number): string => {
  if (revenue <= 0) {
    return "Pre-revenue";
  }

  if (revenue < 5_000) {
    return "Early revenue";
  }

  if (revenue < 25_000) {
    return "Emerging revenue";
  }

  return "Scaled revenue";
};

const getEffort = (stage: StageId, goal: GoalId, revenue: number): GrowthBet["effort"] => {
  if (goal === "positioning") {
    return "low";
  }

  if (stage === "scaling" || revenue >= 25_000 || goal === "retention" || goal === "monetization") {
    return "high";
  }

  if (stage === "growing" || revenue >= 5_000) {
    return "medium";
  }

  return "low";
};

const clampConstraints = (constraints: string): string =>
  constraints.trim().length > 120 ? `${constraints.trim().slice(0, 117).trimEnd()}...` : constraints.trim();

const resolveChannels = (ctx: RecommendationContext, goal: GoalId): string[] => {
  const defaults = goalChannelDefaults[goal];
  const chosen = ctx.channels.filter((channel) => defaults.includes(channel));
  const ids = unique((chosen.length > 0 ? chosen : defaults.slice(0, 2)).slice(0, 2));
  return ids.map((channel) => getQuestionLabel("channels", channel));
};

const getFoundationBet = (ctx: RecommendationContext): GrowthBet => ({
  title:
    ctx.stage === "idea"
      ? "Lock one sharp ICP and proof point"
      : ctx.stage === "launching"
        ? "Build a weekly operating scorecard"
        : ctx.stage === "growing"
          ? "Tighten the best-performing funnel stage"
          : "Systemize channel review and retention coverage",
  rationale:
    ctx.stage === "idea"
      ? `Your ${ctx.modelLabel.toLowerCase()} offer still needs a repeatable narrative. Use the next cycle to validate one audience segment and collect proof before widening tests.`
      : ctx.stage === "launching"
        ? `The next unlock is operational discipline. Pair one demand metric with one activation metric so experiments stop competing with each other.`
        : ctx.stage === "growing"
          ? `You already have traction. The fastest gain is usually removing friction from the funnel stage that is closest to revenue.`
          : `At this stage, efficiency matters as much as growth. Build a reliable cadence for channel allocation, retention health, and expansion opportunities.`,
  channels: ctx.channelLabels.slice(0, 2),
  effort: getEffort(ctx.stage, ctx.primaryGoal, ctx.revenue),
  horizon: ctx.stage === "scaling" ? "30-60 days" : "14-30 days"
});

const buildGoalBet = (ctx: RecommendationContext, goal: GoalId): GrowthBet => {
  const channels = resolveChannels(ctx, goal);
  const constraintsNote = clampConstraints(ctx.constraints);

  switch (goal) {
    case "acquisition":
      return {
        title: `Stand up one repeatable ${channels[0]?.toLowerCase() ?? "acquisition"} pipeline`,
        rationale: `A ${ctx.stageLabel.toLowerCase()} ${ctx.modelLabel.toLowerCase()} should avoid channel sprawl. Focus on ${channels.join(" + ")} and shape one weekly experiment loop that respects: ${constraintsNote}.`,
        channels,
        effort: getEffort(ctx.stage, goal, ctx.revenue),
        horizon: "14-30 days"
      };
    case "activation":
      return {
        title: "Shorten time-to-value inside the first session",
        rationale: `Activation is the leverage point for this ${ctx.modelLabel.toLowerCase()} motion. Instrument the first-value path, remove optional steps, and use quick lifecycle follow-up when users stall.`,
        channels,
        effort: getEffort(ctx.stage, goal, ctx.revenue),
        horizon: "7-21 days"
      };
    case "retention":
      return {
        title: "Install a simple retention and win-back loop",
        rationale: `Retention compounds every channel you already have. Start with churn signals, a weekly save playbook, and one re-engagement sequence tied to the main value moment.`,
        channels,
        effort: getEffort(ctx.stage, goal, ctx.revenue),
        horizon: "21-45 days"
      };
    case "monetization":
      return {
        title: "Test packaging and upgrade triggers around core value",
        rationale: `Revenue is already real enough to learn from. Audit where users hit value, then test packaging, usage thresholds, or service bundles that match willingness to pay.`,
        channels,
        effort: getEffort(ctx.stage, goal, ctx.revenue),
        horizon: "21-45 days"
      };
    case "positioning":
      return {
        title: "Rewrite the ICP narrative around one painful outcome",
        rationale: `The current plan should make the offer easier to understand before it tries to make it louder. Refine the promise, proof, and objections for a single buyer segment.`,
        channels,
        effort: getEffort(ctx.stage, goal, ctx.revenue),
        horizon: "7-14 days"
      };
  }
};

const buildNextSteps = (ctx: RecommendationContext, bets: GrowthBet[]): string[] => [
  `Turn the first bet into a seven-day experiment brief with one owner, one metric, and one stop/go threshold.`,
  `Instrument the funnel with a lightweight scorecard for ${ctx.goalLabels.join(" and ").toLowerCase()}.`,
  `${stageDefaults[ctx.stage].nextStep} Keep constraints visible: ${clampConstraints(ctx.constraints)}.`,
  `Review the first signals after ${bets[0]?.horizon ?? "14 days"} and either double down or replace the bet.`
];

const buildSuggestedTools = (ctx: RecommendationContext): SuggestedTool[] => {
  const toolKeys = unique(
    [
      ...ctx.goals.flatMap((goal) => goalToolMap[goal]),
      ctx.model === "saas" || ctx.model === "consumer" ? "posthog" : "hubspot",
      ...ctx.channels.flatMap((channel) => channelToolMap[channel]),
    ].filter(Boolean)
  ).slice(0, 4);

  return toolKeys.map((toolKey) => toolCatalog[toolKey]);
};

const buildContext = (input: PlanInput): RecommendationContext => {
  const stageValue = typeof input.answers.businessStage === "string" ? input.answers.businessStage : "";
  const modelValue = typeof input.answers.businessModel === "string" ? input.answers.businessModel : "";
  const stage: StageId = hasValue(stageValue, stageValues) ? stageValue : "launching";
  const model: ModelId = hasValue(modelValue, modelValues) ? modelValue : "saas";
  const goals = Array.isArray(input.answers.growthGoals)
    ? input.answers.growthGoals.filter((goal): goal is GoalId => hasValue(goal, goalValues))
    : [];
  const channels = Array.isArray(input.answers.channels)
    ? input.answers.channels.filter((channel): channel is ChannelId => hasValue(channel, channelValues))
    : [];
  const revenue = Number(input.answers.monthlyRevenue ?? 0);
  const constraints = typeof input.answers.constraints === "string" ? input.answers.constraints : "";
  const primaryGoal = goals[0] ?? "acquisition";

  return {
    stage,
    stageLabel: getQuestionLabel("businessStage", stage),
    model,
    modelLabel: getQuestionLabel("businessModel", model),
    revenue: Number.isFinite(revenue) ? revenue : 0,
    revenueBand: getRevenueBand(Number.isFinite(revenue) ? revenue : 0),
    goals: goals.length > 0 ? goals : ["acquisition"],
    goalLabels:
      goals.length > 0 ? goals.map((goal) => getQuestionLabel("growthGoals", goal)) : [getQuestionLabel("growthGoals", "acquisition")],
    primaryGoal,
    channels: channels.length > 0 ? channels : goalChannelDefaults[primaryGoal].slice(0, 2),
    channelLabels:
      channels.length > 0
        ? channels.map((channel) => getQuestionLabel("channels", channel))
        : goalChannelDefaults[primaryGoal]
            .slice(0, 2)
            .map((channel) => getQuestionLabel("channels", channel)),
    constraints: constraints || "No extra constraints were provided."
  };
};

export const createGrowthRecommendation = (input: PlanInput): GrowthRecommendation => {
  const ctx = buildContext(input);
  const betOrder: Array<GoalId | "foundation"> = [...unique(ctx.goals), "foundation"];
  const bets = betOrder.map((goal) => (goal === "foundation" ? getFoundationBet(ctx) : buildGoalBet(ctx, goal)));

  return {
    summary: `${ctx.stageLabel} ${ctx.modelLabel.toLowerCase()} with ${ctx.revenueBand.toLowerCase()} should focus on ${ctx.goalLabels.join(
      " and "
    ).toLowerCase()} before adding more channels.`,
    readinessNote: stageDefaults[ctx.stage].note,
    profile: {
      stage: ctx.stageLabel,
      model: ctx.modelLabel,
      revenueBand: ctx.revenueBand,
      primaryMotion: stageDefaults[ctx.stage].motion
    },
    bets: bets.slice(0, 3),
    suggestedTools: buildSuggestedTools(ctx),
    referenceCompanies: modelReferenceCompanies[ctx.model],
    nextSteps: buildNextSteps(ctx, bets)
  };
};
