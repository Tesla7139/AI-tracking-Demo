"use client";

import { useState } from "react";
import { ChevronRight, Droplets, MapPin, Truck, Wind } from "lucide-react";
import type { GeoLocation, Weather } from "@/lib/site";
import { orderMock, localTimeLabel } from "@/lib/tracking";
import { ShipmentJourney } from "./ShipmentJourney";
import { OrderDetails } from "./OrderDetails";
import { WeatherMotif } from "./animations";
import { BottomSheet } from "./sheet";

/** Accent-tinted round icon chip for the status rows. */
function IconChip({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${accent}1a`, color: accent }}
    >
      {children}
    </span>
  );
}

/**
 * Mobile status summary: current status + last update, with "Track Details" and
 * "Order Details" buttons that open the full journey / order info in a bottom sheet
 * contained inside the phone screen.
 */
export function MobileStatus({
  location,
  weather,
  accent,
  orderValue,
}: {
  location: GeoLocation | null;
  weather: Weather | null;
  accent: string;
  orderValue: string;
}) {
  const [panel, setPanel] = useState<null | "track" | "order">(null);
  const city = location?.city ?? "your city";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft-md">
        {/* Top row: status on the left, compact weather tucked into the empty top-right. */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Status</p>
            <div className="mt-2 flex items-center gap-3">
              <IconChip accent={accent}><Truck className="size-5" /></IconChip>
              <p className="text-2xl font-bold" style={{ color: accent }}>{orderMock.status}</p>
            </div>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last Update</p>
            <div className="mt-2 flex items-center gap-3">
              <IconChip accent={accent}><MapPin className="size-5" /></IconChip>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight" style={{ color: accent }}>Received at {city}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{orderMock.latestUpdateTimeLabel}</p>
              </div>
            </div>
          </div>

          {weather && (
            <div id="tour-weather" className="w-[48%] shrink-0 rounded-xl border border-border/60 bg-card p-4 scroll-mt-24">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0" style={{ width: 52, height: 52 }}>
                  <div style={{ width: 150, height: 150, transform: "scale(0.347)", transformOrigin: "top left" }}>
                    <WeatherMotif iconKey={weather.iconKey} isDay={weather.isDay} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none text-foreground">{weather.tempF}°F</p>
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">{weather.condition}</p>
                </div>
              </div>
              <p className="mt-2.5 truncate text-[11px] text-muted-foreground">
                {location?.city ? `${location.city} · ` : ""}
                {localTimeLabel(location?.timezone ?? null)}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Droplets className="size-3.5" />{weather.humidity}%</span>
                <span className="inline-flex items-center gap-1"><Wind className="size-3.5" />{weather.windMph} mph</span>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPanel("track")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.99]"
          style={{ background: accent }}
        >
          Track Details
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setPanel("order")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3.5 text-[15px] font-bold text-foreground transition-colors hover:bg-background-muted active:scale-[0.99]"
        >
          Order Details
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Detail views open as a bottom sheet contained inside the phone screen. */}
      <BottomSheet open={panel === "track"} onClose={() => setPanel(null)} title="Shipment Journey">
        <ShipmentJourney location={location} accent={accent} embedded />
      </BottomSheet>
      <BottomSheet open={panel === "order"} onClose={() => setPanel(null)} title="Order Details">
        <OrderDetails orderValue={orderValue} embedded />
      </BottomSheet>
    </div>
  );
}
