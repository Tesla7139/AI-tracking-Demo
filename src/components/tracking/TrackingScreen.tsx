"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import type { Brand } from "@/lib/site";
import { TOUR_STEPS, firstSectionStepForCard } from "@/lib/tour";
import type { Generated } from "@/hooks/useGenerated";
import { FeaturePanel } from "./FeaturePanel";
import { TourOverlay, type TargetRect } from "./TourOverlay";
import { EmailView } from "./EmailPreview";
import { DeviceContext } from "./device";
import { PhoneFrame } from "./PhoneFrame";

// Mobile "Features" dropdown — mirrors the desktop left feature panel. Each item fires
// the same event a feature card does (section preview, or open the AI email).
const fire = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, detail ? { detail } : undefined));
const MOBILE_FEATURES: { title: string; run: () => void }[] = [
  { title: "AI recommendations", run: () => fire("cp:preview-feature", { card: 0 }) },
  { title: "Real-time tracking", run: () => fire("cp:preview-feature", { card: 1 }) },
  { title: "Personalized tips", run: () => fire("cp:preview-feature", { card: 2 }) },
  { title: "AI Emails", run: () => fire("cp:open-email") },
];

/**
 * Frames the tracking page inside a "screen" on a light sky-blue backdrop (like
 * the old demo stage), with a feature-copy panel beside it on wide viewports.
 * The screen is a fixed height (viewport minus padding); its content scrolls.
 */
export function TrackingScreen({
  brand,
  generated,
  children,
}: {
  brand: Brand;
  generated: Generated | null;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Full guided tour step index (Start-tour button), or null when off.
  const [step, setStep] = useState<number | null>(null);
  // AI email preview modal open/closed.
  const [emailOpen, setEmailOpen] = useState(false);
  // Device preview: desktop (wide frame) or mobile (phone-shaped frame).
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  // Real small-screen device (not a desktop previewing mobile) → full-screen layout.
  const [compact, setCompact] = useState(false);
  // Mobile "Features" dropdown open/closed.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
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
      setEmailOpen(false);
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
      setEmailOpen(false);
      setStep(null);
      setPreview(firstSectionStepForCard(card));
    };
    window.addEventListener("cp:preview-feature", onPreview as EventListener);
    return () => window.removeEventListener("cp:preview-feature", onPreview as EventListener);
  }, []);

  // AI Emails feature card → open the branded email preview modal.
  useEffect(() => {
    const onEmail = () => {
      setStep(null);
      setPreview(null);
      setEmailOpen(true);
    };
    window.addEventListener("cp:open-email", onEmail as EventListener);
    return () => window.removeEventListener("cp:open-email", onEmail as EventListener);
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

  const bgStyle = {
    background: "radial-gradient(130% 120% at 50% -10%, #f6fbff 0%, #e6f4ff 55%, #d3ecff 100%)",
  };

  // Real mobile devices: full-screen content, no device frame / toggle (the toggle
  // is a desktop-only "preview mobile" affordance and the frame would overflow here).
  if (compact) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden" style={bgStyle}>
        <div className="flex items-center gap-2 px-3 pb-2 pt-3 pr-12">
          {/* Features dropdown (replaces the desktop left feature panel on mobile) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 shadow-md ring-1 ring-black/5"
            >
              Features
              <ChevronDown className={`size-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1.5 w-60 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10">
                  {MOBILE_FEATURES.map((f) => (
                    <button
                      key={f.title}
                      type="button"
                      onClick={() => {
                        f.run();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[14px] font-medium text-slate-800 hover:bg-slate-50"
                    >
                      {f.title}
                      <ChevronRight className="size-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cp:start-tour"))}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 shadow-md ring-1 ring-black/5"
          >
            <Play className="size-3 fill-slate-900 text-slate-900" />
            Start tour
          </button>
          <a
            href="#"
            className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-white shadow-md"
          >
            Book a demo
          </a>
        </div>
        <div className="mx-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/10">
          <div ref={scrollRef} className="thin-scrollbar h-full flex-1 overflow-y-auto overflow-x-hidden">
            <DeviceContext.Provider value="mobile">
              {emailOpen ? (
                <EmailView brand={brand} generated={generated} onClose={() => setEmailOpen(false)} />
              ) : (
                children
              )}
            </DeviceContext.Provider>
          </div>
        </div>

        {activeIndex !== null && TOUR_STEPS[activeIndex] && (
          <TourOverlay
            rect={rect}
            title={TOUR_STEPS[activeIndex].title}
            desc={TOUR_STEPS[activeIndex].desc}
            step={activeIndex}
            total={TOUR_STEPS.length}
            preview={isPreview}
            nextLabel="Next"
            onNext={() => setStep((s) => (s === null ? s : Math.min(s + 1, TOUR_STEPS.length - 1)))}
            onBack={() => setStep((s) => (s === null ? s : Math.max(s - 1, 0)))}
            onClose={endTour}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center gap-8 overflow-hidden p-3 sm:p-6 lg:gap-10 lg:px-10 lg:py-4"
      style={bgStyle}
    >
      <FeaturePanel
        brand={brand}
        className={`hidden xl:flex ${view === "mobile" ? "absolute left-6 top-6 z-10" : ""}`}
        activeStep={activeIndex}
      />

      {/* Persistent top-right CTA (same spot in desktop and mobile), left of the close X */}
      <a
        href="#"
        className="absolute right-[76px] top-4 z-[70] rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
      >
        Book a free demo
      </a>

      {(() => {
        const startTour = (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("cp:start-tour"))}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-slate-900 shadow-md ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
          >
            <Play className="size-3 fill-slate-900 text-slate-900" />
            Start tour
          </button>
        );
        const seg = "rounded-full px-4 py-1 text-[13px] transition-all";
        const toggle = (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 p-1 shadow-md ring-1 ring-black/5">
            <button
              type="button"
              onClick={() => setView("desktop")}
              className={`${seg} ${
                view === "desktop"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "font-medium text-slate-500 hover:text-slate-700"
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setView("mobile")}
              className={`${seg} ${
                view === "mobile"
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "font-medium text-slate-500 hover:text-slate-700"
              }`}
            >
              Mobile
            </button>
          </div>
        );
        const screen = (
          <div ref={scrollRef} className="thin-scrollbar h-full flex-1 overflow-y-auto overflow-x-hidden">
            <DeviceContext.Provider value={view}>
              {emailOpen ? (
                <EmailView brand={brand} generated={generated} onClose={() => setEmailOpen(false)} />
              ) : (
                children
              )}
            </DeviceContext.Provider>
          </div>
        );

        return (
          <AnimatePresence mode="wait" initial={false}>
            {view === "desktop" ? (
              // Desktop: controls in a top bar above a wide framed screen.
              <motion.div
                key="desktop"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full w-full min-w-0 max-w-[1040px] flex-col gap-3"
              >
                <div className="relative flex min-w-0 shrink-0 items-center">
                  {startTour}
                  <div className="absolute left-1/2 -translate-x-1/2">{toggle}</div>
                </div>
                <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] ring-2 ring-black">
                  {screen}
                </div>
              </motion.div>
            ) : (
              // Mobile: phone dead-centre (full height); controls stacked at its top-right.
              <motion.div
                key="mobile"
                initial={{ opacity: 0, scale: 0.82, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.82, y: 24 }}
                transition={{ type: "spring", stiffness: 190, damping: 23 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <PhoneFrame>{screen}</PhoneFrame>
                {/* Start tour to the left of the phone, device toggle to the right — both at top */}
                <div className="absolute top-6" style={{ right: "calc(50% + 205px)" }}>
                  {startTour}
                </div>
                <div className="absolute top-6" style={{ left: "calc(50% + 205px)" }}>
                  {toggle}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}

      {activeIndex !== null && TOUR_STEPS[activeIndex] && (
        <TourOverlay
          rect={rect}
          title={TOUR_STEPS[activeIndex].title}
          desc={TOUR_STEPS[activeIndex].desc}
          step={activeIndex}
          total={TOUR_STEPS.length}
          preview={isPreview}
          nextLabel="Next"
          onNext={() => setStep((s) => (s === null ? s : Math.min(s + 1, TOUR_STEPS.length - 1)))}
          onBack={() => setStep((s) => (s === null ? s : Math.max(s - 1, 0)))}
          onClose={endTour}
        />
      )}
    </div>
  );
}
