"use client";

import { ChevronRight } from "lucide-react";
import type { Brand } from "@/lib/site";
import { TOUR_STEPS } from "@/lib/tour";
import { cn } from "@/lib/utils";

// Curated from the Clickpost deck, main feature first. The array index is the
// card's id; tour steps reference it via TOUR_STEPS[i].card.
const FEATURES = [
  { title: "AI recommendations" },
  { title: "Real-time tracking" },
  { title: "Personalized tips" },
];

/** Clickpost feature list shown beside the framed screen. Clicking a card launches the
 *  guided tour at that feature's step; the card matching the active tour step highlights. */
export function FeaturePanel({
  brand,
  className,
  activeStep,
}: {
  brand: Brand;
  className?: string;
  activeStep?: number | null;
}) {
  void brand;

  // Which card owns the currently-active tour step (so the right card highlights).
  const activeCard =
    typeof activeStep === "number" ? TOUR_STEPS[activeStep]?.card ?? null : null;

  // Clicking a card does NOT start the full tour — it quickly previews that feature's
  // section: scroll to it, spotlight it, show a note, then auto-dismiss (see TrackingScreen).
  const select = (cardIndex: number) => {
    window.dispatchEvent(new CustomEvent("cp:preview-feature", { detail: { card: cardIndex } }));
  };

  return (
    <aside className={cn("w-[320px] shrink-0 flex-col self-start pt-1", className)} style={{ zoom: 0.8 }}>
      {/* Wordmark */}
      <span className="text-3xl font-extrabold tracking-tight">
        <span className="text-primary">CLICK</span>
        <span className="text-slate-900">POST</span>
      </span>

      <h2 className="mt-5 text-2xl font-extrabold italic tracking-tight text-slate-900">
        Click a feature to run it live.
      </h2>

      <ul className="mt-6 flex flex-col gap-3">
        {FEATURES.map((f, i) => {
          const on = activeCard === i;
          return (
            <li key={f.title}>
              <button
                id={`feature-card-${i}`}
                type="button"
                onClick={() => select(i)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
                  on
                    ? "border-primary/30 bg-primary/10 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <span className="text-[15px] font-semibold text-slate-900">{f.title}</span>
                <ChevronRight className={cn("size-5", on ? "text-primary" : "text-slate-400")} />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
