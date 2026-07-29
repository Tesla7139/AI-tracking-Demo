"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WEATHER, type Weather } from "@/lib/site";

/**
 * Live weather for the given coordinates (the brand's city). Seeded with a default
 * so the widget shows immediately; the real value swaps in when it resolves.
 */
export function useWeather(lat?: number | null, lon?: number | null) {
  const [weather, setWeather] = useState<Weather | null>(DEFAULT_WEATHER);

  useEffect(() => {
    if (lat == null || lon == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!cancelled && res.ok) setWeather((await res.json()) as Weather);
      } catch {
        /* keep the seeded default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return weather;
}
