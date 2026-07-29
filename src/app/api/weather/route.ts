import { NextResponse } from "next/server";
import type { Weather, WeatherIconKey } from "@/lib/site";

export const runtime = "nodejs";

// In-memory cache so repeat loads return instantly (per server instance).
const cache = new Map<string, { data: Weather; at: number }>();
const TTL = 1000 * 60 * 15; // 15 min

// WMO weather interpretation codes → a human label + UI icon key.
// https://open-meteo.com/en/docs
function interpret(code: number): { condition: string; iconKey: WeatherIconKey } {
  if (code === 0) return { condition: "Clear", iconKey: "clear" };
  if (code === 1) return { condition: "Mainly clear", iconKey: "clear" };
  if (code === 2) return { condition: "Partly cloudy", iconKey: "cloudy" };
  if (code === 3) return { condition: "Overcast", iconKey: "cloudy" };
  if (code === 45 || code === 48) return { condition: "Fog", iconKey: "fog" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", iconKey: "rain" };
  if (code >= 61 && code <= 67) return { condition: "Rain", iconKey: "rain" };
  if (code >= 71 && code <= 77) return { condition: "Snow", iconKey: "snow" };
  if (code >= 80 && code <= 82) return { condition: "Rain showers", iconKey: "rain" };
  if (code === 85 || code === 86) return { condition: "Snow showers", iconKey: "snow" };
  if (code >= 95) return { condition: "Thunderstorm", iconKey: "thunder" };
  return { condition: "Cloudy", iconKey: "cloudy" };
}

type OpenMeteo = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json(hit.data);
  }

  const api =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph`;

  // Try twice with a short timeout — the client already shows a sensible default,
  // so we prefer to fail fast rather than hang the request.
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(api, { signal: controller.signal });
      if (!res.ok) continue;
      const d = (await res.json()) as OpenMeteo;
      const c = d.current;
      if (!c || typeof c.temperature_2m !== "number" || typeof c.weather_code !== "number") {
        continue;
      }
      const { condition, iconKey } = interpret(c.weather_code);
      const weather: Weather = {
        tempF: Math.round(c.temperature_2m),
        condition,
        iconKey,
        isDay: c.is_day !== 0,
        humidity: Math.round(c.relative_humidity_2m ?? 0),
        windMph: Math.round(c.wind_speed_10m ?? 0),
      };
      cache.set(key, { data: weather, at: Date.now() });
      return NextResponse.json(weather);
    } catch {
      /* retry */
    } finally {
      clearTimeout(timer);
    }
  }
  // On failure return non-OK so the client keeps its seeded default weather.
  return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
}
