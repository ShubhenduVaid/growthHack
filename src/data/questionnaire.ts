import type { Question } from "../types";

export const questionnaire: Question[] = [
  {
    id: "businessStage",
    type: "single",
    stepLabel: "Business",
    prompt: "Where is the business right now?",
    helpText: "This anchors the level of risk and the kind of growth moves we should recommend.",
    required: true,
    options: [
      { id: "idea", label: "Idea stage", description: "Still validating the offer or audience." },
      { id: "launching", label: "Launching", description: "The product is live, but repeatable traction is not there yet." },
      { id: "growing", label: "Growing", description: "Early traction exists and you need stronger acquisition loops." },
      { id: "scaling", label: "Scaling", description: "You have revenue and need leverage, systems, and channel depth." }
    ]
  },
  {
    id: "businessModel",
    type: "single",
    stepLabel: "Offer",
    prompt: "Which business model best describes the offer?",
    helpText: "A growth plan for SaaS should look different from one for services or marketplaces.",
    required: true,
    options: [
      { id: "saas", label: "SaaS product", description: "Recurring software revenue." },
      { id: "services", label: "Services / agency", description: "Outcome-driven work sold through expertise." },
      { id: "marketplace", label: "Marketplace", description: "Supply and demand need to be activated together." },
      { id: "consumer", label: "Consumer app", description: "Growth depends on retention, loops, and broad reach." }
    ]
  },
  {
    id: "monthlyRevenue",
    type: "number",
    stepLabel: "Signal",
    prompt: "What is the current monthly revenue in USD?",
    helpText: "Use `0` if there is no revenue yet. This helps calibrate channel budget and urgency.",
    required: true,
    placeholder: "0",
    min: 0
  },
  {
    id: "growthGoals",
    type: "multi",
    stepLabel: "Goals",
    prompt: "What do you need the growth plan to optimize for first?",
    helpText: "Choose the one or two outcomes that matter most for the next 90 days.",
    required: true,
    minSelections: 1,
    options: [
      { id: "acquisition", label: "New customer acquisition", description: "More qualified demand at the top of the funnel." },
      { id: "activation", label: "Activation", description: "Improve conversion from visitor or signup to value." },
      { id: "retention", label: "Retention", description: "Increase repeat usage and reduce churn." },
      { id: "monetization", label: "Monetization", description: "Improve pricing, packaging, and revenue per customer." },
      { id: "positioning", label: "Positioning clarity", description: "Tighten message-market fit and ICP." }
    ]
  },
  {
    id: "channels",
    type: "multi",
    stepLabel: "Channels",
    prompt: "Which channels are already in play or feel realistic to test?",
    helpText: "This keeps future recommendations grounded in available leverage instead of generic advice.",
    required: true,
    minSelections: 1,
    options: [
      { id: "seo", label: "SEO / content", description: "Compounding organic acquisition." },
      { id: "outbound", label: "Outbound", description: "Founder-led or team-led prospecting." },
      { id: "paid", label: "Paid acquisition", description: "Search, social, or display campaigns." },
      { id: "community", label: "Community / social", description: "Audience building and word of mouth." },
      { id: "partnerships", label: "Partnerships", description: "Referrals, integrations, affiliates, and co-marketing." }
    ]
  },
  {
    id: "constraints",
    type: "text",
    stepLabel: "Constraints",
    prompt: "What constraints or context should the plan respect?",
    helpText: "Include team size, budget limits, compliance, sales cycle details, or anything else the plan should not ignore.",
    required: true,
    placeholder: "Example: founder-led team of two, budget under $3k/month, sales cycle is 30-45 days.",
    maxLength: 320
  }
];
