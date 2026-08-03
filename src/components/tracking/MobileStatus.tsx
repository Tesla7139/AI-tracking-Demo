"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin, Truck } from "lucide-react";
import type { GeoLocation } from "@/lib/site";
import { orderMock } from "@/lib/tracking";
import { ShipmentJourney } from "./ShipmentJourney";
import { OrderDetails } from "./OrderDetails";

/**
 * Mobile status summary: current status + last update, with "Track Details" and
 * "Order Details" buttons that reveal the full journey / order info in place
 * (progressive disclosure, one open at a time).
 */
export function MobileStatus({
  location,
  accent,
  orderValue,
}: {
  location: GeoLocation | null;
  accent: string;
  orderValue: string;
}) {
  const [panel, setPanel] = useState<null | "track" | "order">(null);
  const city = location?.city ?? "your city";
  const toggle = (p: "track" | "order") => setPanel((cur) => (cur === p ? null : p));

  const Icon = ({ children }: { children: React.ReactNode }) => (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${accent}1a`, color: accent }}
    >
      {children}
    </span>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft-md">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Status</p>
        <div className="mt-2 flex items-center gap-3">
          <Icon><Truck className="size-5" /></Icon>
          <p className="text-2xl font-bold" style={{ color: accent }}>{orderMock.status}</p>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last Update</p>
        <div className="mt-2 flex items-center gap-3">
          <Icon><MapPin className="size-5" /></Icon>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight" style={{ color: accent }}>Received at {city}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{orderMock.latestUpdateTimeLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggle("track")}
          aria-expanded={panel === "track"}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.99]"
          style={{ background: accent }}
        >
          Track Details
          <ChevronDown className={`size-4 transition-transform ${panel === "track" ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => toggle("order")}
          aria-expanded={panel === "order"}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-[15px] font-bold text-foreground transition-colors hover:bg-background-muted"
        >
          Order Details
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${panel === "order" ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Progressive disclosure — the chosen detail card appears below the buttons. */}
      <AnimatePresence mode="wait">
        {panel === "track" && (
          <motion.div
            key="track"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ShipmentJourney location={location} accent={accent} />
          </motion.div>
        )}
        {panel === "order" && (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <OrderDetails orderValue={orderValue} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
