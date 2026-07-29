// Guided product tour. The tour is two-level: for each feature it first spotlights
// the feature CARD in the left panel (introducing the feature), then walks through
// that feature's SECTION(s) on the tracking page, then moves to the next feature.
//
// Order of features: AI recommendations / upsell -> real-time tracking -> personalized tips.

export type TourStep = {
  /** DOM id of the element to spotlight (a feature card or a page section). */
  target: string;
  /** "feature" = a card in the left panel (intro); "section" = a block on the page. */
  kind: "feature" | "section";
  /** Index of the left FeaturePanel card this step belongs to (which card highlights). */
  card: number;
  title: string;
  desc: string;
};

export const TOUR_STEPS: TourStep[] = [
  // Feature 1 — AI recommendations / upsell
  {
    card: 0,
    kind: "feature",
    target: "feature-card-0",
    title: "AI recommendations",
    desc: "Clickpost turns every tracking visit into a selling moment. AI reads the order and surfaces matched add-ons and tips. Let's see it live.",
  },
  {
    card: 0,
    kind: "section",
    target: "tour-items",
    title: "Matched upsell on each item",
    desc: "Every ordered item gets AI tips plus a hand-picked add-on with a one-tap buy, turning post-purchase attention into incremental revenue.",
  },
  {
    card: 0,
    kind: "section",
    target: "tour-arrivals",
    title: "New arrivals that convert",
    desc: "A carousel pulled from the store's live catalog, placed right where attention is highest to prompt the next order.",
  },

  // Feature 2 — Real-time tracking
  {
    card: 1,
    kind: "feature",
    target: "feature-card-1",
    title: "Real-time tracking",
    desc: "The number one reason shoppers open a tracking page. Clickpost keeps status and ETA accurate and fully branded. Here's how it looks.",
  },
  {
    card: 1,
    kind: "section",
    target: "tour-status",
    title: "Live status & delivery ETA",
    desc: "An always-current order status with an accurate delivery estimate, front and center the moment the page loads.",
  },
  {
    card: 1,
    kind: "section",
    target: "tour-journey",
    title: "Every scan, in real time",
    desc: "A live timeline of each checkpoint from order placed to out for delivery, so customers never have to ask where their order is.",
  },

  // Feature 3 — Personalized tips
  {
    card: 2,
    kind: "feature",
    target: "feature-card-2",
    title: "Personalized tips",
    desc: "Small personal touches keep shoppers engaged while they wait. Clickpost adds local context and brand stories. Take a look.",
  },
  {
    card: 2,
    kind: "section",
    target: "tour-weather",
    title: "Weather at the doorstep",
    desc: "Live weather for the delivery city makes the page feel timely and personal, a small detail that keeps shoppers coming back.",
  },
  {
    card: 2,
    kind: "section",
    target: "tour-didyouknow",
    title: "AI brand anecdotes",
    desc: "Warm 'did you know' stories generated for each store, turning idle tracking checks into brand-building moments.",
  },
];

/** First tour step index that belongs to a given feature card (for the full tour). */
export function firstStepForCard(card: number): number {
  const i = TOUR_STEPS.findIndex((s) => s.card === card);
  return i === -1 ? 0 : i;
}

/** First on-page SECTION step for a card — the target for the quick card-click preview. */
export function firstSectionStepForCard(card: number): number {
  const i = TOUR_STEPS.findIndex((s) => s.card === card && s.kind === "section");
  return i === -1 ? firstStepForCard(card) : i;
}
