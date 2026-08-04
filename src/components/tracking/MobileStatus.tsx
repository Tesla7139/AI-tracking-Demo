"use client";

import { useState } from "react";
import { Droplets, MapPin, MapPinned, Truck, Wind } from "lucide-react";
import type { GeoLocation, Weather } from "@/lib/site";
import { orderMock, localTimeLabel } from "@/lib/tracking";
import { ShipmentJourney } from "./ShipmentJourney";
import { OrderDetails } from "./OrderDetails";
import { InfoCard } from "./InfoCard";
import { WeatherMotif } from "./animations";
import { BottomSheet } from "./sheet";

/** Accent-tinted round icon chip for the status rows. */
function IconChip({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${accent}1a`, color: accent }}
    >
      {children}
    </span>
  );
}

/** Compact local-weather card (sits beside the fun fact at the top of the sheet). */
function WeatherCard({
  weather,
  location,
}: {
  weather: Weather;
  location: GeoLocation | null;
}) {
  return (
    <div id="tour-weather" className="w-full rounded-xl border border-border/60 bg-background-muted/40 p-2.5 scroll-mt-24">
      <div className="flex items-center gap-1.5">
        <div className="shrink-0" style={{ width: 36, height: 36 }}>
          <div style={{ width: 150, height: 150, transform: "scale(0.24)", transformOrigin: "top left" }}>
            <WeatherMotif iconKey={weather.iconKey} isDay={weather.isDay} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold leading-none text-foreground">{weather.tempF}°F</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-foreground">{weather.condition}</p>
        </div>
      </div>
      <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
        {location?.city ? `${location.city} · ` : ""}
        {localTimeLabel(location?.timezone ?? null)}
      </p>
      <div className="mt-1 flex items-center gap-2.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Droplets className="size-3" />{weather.humidity}%</span>
        <span className="inline-flex items-center gap-1"><Wind className="size-3" />{weather.windMph} mph</span>
      </div>
    </div>
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
  funFacts,
  city: cityName,
  accent,
  orderValue,
}: {
  location: GeoLocation | null;
  weather: Weather | null;
  funFacts: string[];
  city: string | null;
  accent: string;
  orderValue: string;
}) {
  const [panel, setPanel] = useState<null | "track" | "order">(null);
  const city = location?.city ?? "your city";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative z-[1] rounded-2xl border border-border bg-card p-5 shadow-soft-md">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Status</p>
        <div className="mt-2 flex items-center gap-2.5">
          <IconChip accent={accent}><Truck className="size-4" /></IconChip>
          <p className="text-xl font-bold" style={{ color: accent }}>{orderMock.status}</p>
        </div>

        <p className="mt-7 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last Update</p>
        <div className="mt-2 flex items-center gap-2.5">
          <IconChip accent={accent}><MapPin className="size-4" /></IconChip>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight" style={{ color: accent }}>Received at {city}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{orderMock.latestUpdateTimeLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPanel("track")}
          className="mt-7 flex w-full items-center justify-center rounded-xl py-4 text-sm font-bold text-white transition-transform active:scale-[0.99]"
          style={{ background: accent }}
        >
          Track Details
        </button>
        <button
          type="button"
          onClick={() => setPanel("order")}
          className="mt-3.5 flex w-full items-center justify-center rounded-xl border border-border py-4 text-sm font-bold text-foreground transition-colors hover:bg-background-muted active:scale-[0.99]"
        >
          Order Details
        </button>
      </div>

      {/* Detail views open as a bottom sheet contained inside the phone screen. */}
      <BottomSheet open={panel === "track"} onClose={() => setPanel(null)} title="Shipment Journey">
        {/* Local weather + city fun fact, side by side */}
        {(weather || funFacts.length > 0) && (
          <div className="mb-4 flex items-start gap-3">
            {weather && (
              <div className="w-[46%] shrink-0">
                <WeatherCard weather={weather} location={location} />
              </div>
            )}
            {funFacts.length > 0 && (
              <div className="min-w-0 flex-1">
                <InfoCard
                  icon={MapPinned}
                  title={cityName ? `${cityName} Fun Fact` : "Local Fun Fact"}
                  items={funFacts}
                  accent={accent}
                />
              </div>
            )}
          </div>
        )}
        <ShipmentJourney location={location} accent={accent} embedded />
      </BottomSheet>
      <BottomSheet open={panel === "order"} onClose={() => setPanel(null)} title="Order Details">
        <OrderDetails orderValue={orderValue} embedded />
      </BottomSheet>
    </div>
  );
}
