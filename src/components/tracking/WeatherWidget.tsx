"use client";

import { Thermometer, Droplets, Wind } from "lucide-react";
import type { GeoLocation, Weather } from "@/lib/site";
import { localTimeLabel } from "@/lib/tracking";
import { WeatherMotif } from "./animations";

export function WeatherWidget({
  location,
  weather,
  accent,
}: {
  location: GeoLocation | null;
  weather: Weather | null;
  accent: string;
}) {
  void accent; // brand-neutral card (matches the Figma); accent kept for API parity
  const city = location?.city ?? null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft-md">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[rgba(17,17,17,0.06)] text-foreground">
          <Thermometer className="size-5" />
        </span>
        <p className="text-base font-bold text-foreground">
          Weather{city ? ` at ${city}` : ""}
        </p>
      </div>

      <div className="mt-4 border-t border-border/60 pt-4">
        {weather ? (
          <>
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-3xl font-bold text-foreground">{weather.tempF}°F</p>
                <p className="mt-1 text-lg font-bold text-foreground">{weather.condition}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {localTimeLabel(location?.timezone ?? null)}
                </p>
              </div>
              {/* Scale the 150px motif disc down so it fits the (narrow) weather card. */}
              <div className="shrink-0 self-center" style={{ width: 104, height: 104 }}>
                <div style={{ width: 150, height: 150, transform: "scale(0.6933)", transformOrigin: "top left" }}>
                  <WeatherMotif iconKey={weather.iconKey} isDay={weather.isDay} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px]">
                <Droplets className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11px]">
                <Wind className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">Wind: {weather.windMph} mph</span>
              </div>
            </div>
          </>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Weather unavailable right now.</p>
        )}
      </div>
    </div>
  );
}
