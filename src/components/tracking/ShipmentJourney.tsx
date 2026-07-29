"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { GeoLocation } from "@/lib/site";
import { buildJourneySteps } from "@/lib/tracking";
import { TrackingCard } from "./TrackingCard";
import { useDevice } from "./device";

export function ShipmentJourney({
  location,
  accent,
}: {
  location: GeoLocation | null;
  accent: string;
}) {
  const city = location?.city ?? "In transit";
  const journeySteps = buildJourneySteps(city);
  // Whether the active step's detailed scan history is expanded.
  const [detailsOpen, setDetailsOpen] = useState(true);
  const mobile = useDevice() === "mobile";

  return (
    <TrackingCard title="Shipment Journey" className={mobile ? "" : "flex h-full flex-col"}>
      {/* Desktop: fill the row and scroll internally (absolute list). Mobile: expand naturally. */}
      <div className={mobile ? "mt-2" : "relative mt-2 min-h-0 flex-1"}>
      <ol className={mobile ? "pr-2" : "thin-scrollbar absolute inset-0 overflow-y-auto pr-2"}>
        {journeySteps.map((step, i) => {
          const done = step.state === "done";
          const active = step.state === "active";
          const isLast = i === journeySteps.length - 1;
          const filled = done || active;
          return (
            <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
              {/* connector line — solid for the completed path, dotted for the path yet to come */}
              {!isLast &&
                (done ? (
                  <span
                    className="absolute left-[13px] top-7 h-full w-0.5 -translate-x-1/2"
                    style={{ background: accent }}
                  />
                ) : (
                  <span
                    className="absolute left-[13px] top-7 h-full w-0.5 -translate-x-1/2"
                    style={{
                      backgroundImage: "linear-gradient(var(--muted-foreground) 45%, transparent 45%)",
                      backgroundSize: "2px 7px",
                      backgroundRepeat: "repeat-y",
                      opacity: 0.5,
                    }}
                  />
                ))}
              {/* dot */}
              <span
                className="relative z-10 mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: filled ? accent : "var(--border)",
                  background: filled ? accent : "var(--card)",
                }}
              >
                {active &&
                  [0, 1].map((r) => (
                    <motion.span
                      key={r}
                      className="absolute rounded-full"
                      style={{ border: `2px solid ${accent}` }}
                      initial={{ width: 10, height: 10, opacity: 0.6 }}
                      animate={{ width: 40, height: 40, opacity: 0 }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: r * 0.9, ease: "easeOut" }}
                    />
                  ))}
                {done && <Check className="size-3.5 text-white" strokeWidth={3} />}
                {active && <span className="size-2.5 rounded-full bg-white" />}
              </span>
              {/* text */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-bold ${active ? "" : "text-foreground"}`}
                  style={active ? { color: accent } : undefined}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.place}
                </p>

                {active && step.details && (
                  <div className="mt-3 flex flex-col gap-3">
                    {detailsOpen &&
                      step.details.map((d, di) => (
                        <div key={di} className="rounded-lg bg-background-muted/60 p-3">
                          <Row label="Location" value={d.location} />
                          <Row label="Time" value={d.time} />
                          <Row label="Remarks" value={d.remarks} />
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => setDetailsOpen((o) => !o)}
                      className="flex w-fit items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                      style={{ color: accent }}
                    >
                      {detailsOpen ? "Close Detailed Journey ▲" : "View Detailed Journey ▼"}
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      </div>
    </TrackingCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-0.5 text-sm">
      <span className="w-20 shrink-0 text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
