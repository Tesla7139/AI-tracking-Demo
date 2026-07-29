import { NextResponse } from "next/server";
import type { GeoLocation } from "@/lib/site";

export const runtime = "nodejs";

// Demo override: the design targets a US customer (New York), so for now we pin the
// location to New York rather than the visitor's real IP city. Set to false to
// re-enable live IP geolocation (the code path below is preserved).
const FORCE_US = true;

const NEW_YORK: GeoLocation = {
  city: "New York",
  region: "New York",
  country: "United States",
  countryCode: "US",
  lat: 40.7128,
  lon: -74.006,
  timezone: "America/New_York",
};

// Fallback location when the lookup fails or we can't resolve a public IP.
const FALLBACK: GeoLocation = NEW_YORK;

/** Pull the client's public IP from proxy headers; null on localhost / direct dev. */
function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

/** Private/loopback ranges we should NOT send to the geo service (it would fail). */
function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("127.") || ip === "0.0.0.0") return true;
  if (/^10\./.test(ip) || /^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

type IpWhoIs = {
  success?: boolean;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: { id?: string };
};

export async function GET(req: Request) {
  if (FORCE_US) return NextResponse.json(NEW_YORK);

  const ip = clientIp(req);
  // On localhost the header is absent → query without an IP so ipwho.is geolocates
  // the server's own public IP (the dev machine's city). Skip private LAN IPs.
  const target = ip && !isPrivateIp(ip) ? ip : "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://ipwho.is/${target}`, {
      signal: controller.signal,
      headers: { "User-Agent": "clickpost-ai-tracking-demo" },
    });
    if (!res.ok) return NextResponse.json(FALLBACK);
    const d = (await res.json()) as IpWhoIs;
    if (!d || d.success === false || typeof d.latitude !== "number") {
      return NextResponse.json(FALLBACK);
    }
    const geo: GeoLocation = {
      city: d.city ?? null,
      region: d.region ?? null,
      country: d.country ?? null,
      countryCode: d.country_code ?? null,
      lat: d.latitude ?? null,
      lon: d.longitude ?? null,
      timezone: d.timezone?.id ?? null,
    };
    return NextResponse.json(geo);
  } catch {
    return NextResponse.json(FALLBACK);
  } finally {
    clearTimeout(timer);
  }
}
