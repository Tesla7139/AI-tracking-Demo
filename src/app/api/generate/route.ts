import { NextResponse } from "next/server";
import {
  aiEnabled,
  generateCityFacts,
  generateBrandFacts,
  recommendUpsells,
} from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

type GenResult = {
  enabled: boolean;
  cityFacts: string[] | null;
  brandFacts: string[] | null;
  upsells: Awaited<ReturnType<typeof recommendUpsells>>;
};

// In-memory cache so demoing the same store repeatedly costs ONE set of calls, not
// one per page load. Keyed by the inputs that affect the output; 24h TTL.
const CACHE = new Map<string, { exp: number; data: GenResult }>();
const TTL_MS = 24 * 60 * 60 * 1000;

// AI-generated content for the tracking page: city fun facts, brand "did you know",
// and per-item upsell recommendations. Returns nulls (client uses static fallbacks)
// until OPENAI_API_KEY is set.
export async function POST(req: Request) {
  let body: {
    brandName?: string;
    description?: string | null;
    city?: string;
    country?: string;
    orderedTitles?: string[];
    catalogTitles?: string[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({ enabled: false, cityFacts: null, brandFacts: null, upsells: null });
  }

  const { brandName, description, city, country, orderedTitles, catalogTitles } = body;

  // Serve from cache when the same brand/city/order was already generated.
  const cacheKey = JSON.stringify({ brandName, city, country, orderedTitles });
  const hit = CACHE.get(cacheKey);
  if (hit && hit.exp > Date.now()) {
    return NextResponse.json(hit.data);
  }

  const [cityFacts, brandFacts, upsells] = await Promise.all([
    city ? generateCityFacts(city, country || "") : Promise.resolve(null),
    brandName ? generateBrandFacts(brandName, description) : Promise.resolve(null),
    orderedTitles?.length && catalogTitles?.length
      ? recommendUpsells(orderedTitles, catalogTitles)
      : Promise.resolve(null),
  ]);

  const data: GenResult = { enabled: true, cityFacts, brandFacts, upsells };

  // Only cache a result that actually produced something, so a transient failure
  // (breaker tripped → all nulls) isn't cached and can be retried later.
  if (cityFacts || brandFacts || upsells) {
    CACHE.set(cacheKey, { exp: Date.now() + TTL_MS, data });
  }

  return NextResponse.json(data);
}
