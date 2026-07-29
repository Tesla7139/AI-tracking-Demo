"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { Brand } from "@/lib/site";
import { TOUR_STEPS, firstSectionStepForCard } from "@/lib/tour";
import { FeaturePanel } from "./FeaturePanel";
import { TourOverlay, type TargetRect } from "./TourOverlay";

/**
 * Frames the tracking page inside a "screen" on a light sky-blue backdrop (like
 * the old demo stage), with a feature-copy panel beside it on wide viewports.
 * The screen is a fixed height (viewport minus padding); its content scrolls.
 */
export function TrackingScreen({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Full guided tour step index (Start-tour button), or null when off.
  const [step, setStep] = useState<number | null>(null);
  // Quick single-section preview index (feature-card click), or null when off.
  const [preview, setPreview] = useState<number | null>(null);
  const [rect, setRect] = useState<TargetRect | null>(null);

  // Scroll the current step's target into view, then measure it for the spotlight.
  const measure = useCallback((index: number) => {
    const s = TOUR_STEPS[index];
    if (!s) return;
    const el = document.getElementById(s.target);
    if (!el) {
      setRect(null);
      return;
    }
    // Feature cards live in the always-visible left panel; only page sections need scrolling.
    if (s.kind === "section") el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Let the smooth scroll settle before measuring, then poll a few times so the
    // ring tracks the element as it eases into place.
    let ticks = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      // Hidden element (e.g. feature panel below xl) measures 0 — show the card with no spotlight.
      setRect(r.width > 0 && r.height > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
      if (ticks++ < 6) window.setTimeout(tick, 60);
    };
    window.setTimeout(tick, s.kind === "section" ? 220 : 40);
  }, []);

  // Start the full tour (Start-tour button). Clears any active preview.
  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<{ step?: number }>).detail;
      const start = typeof detail?.step === "number" ? detail.step : 0;
      setPreview(null);
      setStep(start);
    };
    window.addEventListener("cp:start-tour", onStart as EventListener);
    return () => window.removeEventListener("cp:start-tour", onStart as EventListener);
  }, []);

  // Quick preview (feature-card click): jump to that feature's section, no tour.
  useEffect(() => {
    const onPreview = (e: Event) => {
      const card = (e as CustomEvent<{ card?: number }>).detail?.card ?? 0;
      setStep(null);
      setPreview(firstSectionStepForCard(card));
    };
    window.addEventListener("cp:preview-feature", onPreview as EventListener);
    return () => window.removeEventListener("cp:preview-feature", onPreview as EventListener);
  }, []);

  // The index currently driving the overlay: tour step wins, else the preview.
  const activeIndex = step ?? preview;
  const isPreview = step === null && preview !== null;

  // Re-measure whenever the active index changes (or on resize while open).
  useEffect(() => {
    if (activeIndex === null) return;
    measure(activeIndex);
    const onResize = () => measure(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, measure]);

  const endTour = useCallback(() => {
    setStep(null);
    setPreview(null);
    setRect(null);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center gap-8 overflow-hidden p-3 sm:p-6 lg:gap-10 lg:p-10"
      style={{
        background: "radial-gradient(130% 120% at 50% -10%, #eaf6ff 0%, #c7e6ff 55%, #a5d4ff 100%)",
      }}
    >
      <FeaturePanel brand={brand} className="hidden xl:flex" activeStep={activeIndex} />

      {/* Right side: top bar (Start tour / Book a free demo) + the framed screen */}
      <div className="flex h-full w-full min-w-0 max-w-[1040px] flex-col gap-3">
        <div className="flex min-w-0 shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cp:start-tour"))}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
              <Play className="size-3 fill-white" />
            </span>
            Start tour
          </button>
          <a
            href="#"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            Book a free demo
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/10"
        >
          {/* Scrollable content */}
          <div ref={scrollRef} className="thin-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </motion.div>
      </div>

      {activeIndex !== null && TOUR_STEPS[activeIndex] && (
        <TourOverlay
          rect={rect}
          title={TOUR_STEPS[activeIndex].title}
          desc={TOUR_STEPS[activeIndex].desc}
          step={activeIndex}
          total={TOUR_STEPS.length}
          preview={isPreview}
          nextLabel={TOUR_STEPS[activeIndex + 1]?.kind === "feature" ? "Next feature" : "Next"}
          onNext={() => setStep((s) => (s === null ? s : Math.min(s + 1, TOUR_STEPS.length - 1)))}
          onBack={() => setStep((s) => (s === null ? s : Math.max(s - 1, 0)))}
          onClose={endTour}
        />
      )}
    </div>
  );
}
