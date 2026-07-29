"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WEATHER, type GeoLocation, type Weather } from "@/lib/site";

/**
 * On mount: resolve the visitor's location (IP geolocation, no permission prompt)
 * then fetch the local weather for that lat/lon. Both use real, free, no-key APIs
 * (ipwho.is + Open-Meteo). Failures degrade gracefully to null.
 */
export function usePersonalization() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  // Seed with a default so the widget shows immediately; real value swaps in below.
  const [weather, setWeather] = useState<Weather | null>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const geoRes = await fetch("/api/geo");
        const geo = geoRes.ok ? ((await geoRes.json()) as GeoLocation) : null;
        if (cancelled) return;
        setLocation(geo);

        if (geo?.lat != null && geo?.lon != null) {
          const wRes = await fetch(`/api/weather?lat=${geo.lat}&lon=${geo.lon}`);
          if (!cancelled && wRes.ok) setWeather((await wRes.json()) as Weather);
        }
      } catch {
        /* leave location/weather null — the UI handles the empty state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { location, weather, loading };
}
