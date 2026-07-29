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
              <div>
                <p className="text-3xl font-bold text-foreground">{weather.tempF}°F</p>
                <p className="mt-1 text-lg font-bold text-foreground">{weather.condition}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {localTimeLabel(location?.timezone ?? null)}
                </p>
              </div>
              <WeatherMotif iconKey={weather.iconKey} isDay={weather.isDay} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm">
                <Droplets className="size-4 text-muted-foreground" />
                <span className="text-foreground">Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm">
                <Wind className="size-4 text-muted-foreground" />
                <span className="text-foreground">Wind: {weather.windMph} mph</span>
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
