/**
 * Server-only OpenAI helpers for the personalized tracking page.
 * Every function no-ops (returns null) until OPENAI_API_KEY is set in the env,
 * so the app falls back to the curated/static content until the key is provided.
 *
 * Set the key in product-demo/.env.local:  OPENAI_API_KEY=sk-...
 */

const KEY = process.env.OPENAI_API_KEY;
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

/**
 * Circuit breaker: once the API answers with an auth/quota/rate error we stop
 * calling it for the rest of the process. This prevents a bad or drained key from
 * generating a request on every page load, and makes the app fall straight back to
 * the static content instead of retrying (and paying) repeatedly.
 */
let tripped = false;

/** Master switch: needs a key AND AI_ENABLED not explicitly turned off. */
export function aiEnabled() {
  return Boolean(KEY) && process.env.AI_ENABLED !== "false" && !tripped;
}

/** Call the Chat Completions API and parse a JSON object from the reply. */
async function chatJSON(prompt: string): Promise<Record<string, unknown> | null> {
  if (!aiEnabled()) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You write concise, warm, factually-safe microcopy for a post-purchase order-tracking page. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });
    // Bad key / no quota / rate-limited: trip the breaker so we don't keep trying.
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      tripped = true;
      console.warn(`[ai] OpenAI returned ${res.status}; disabling AI for this process, using static fallbacks.`);
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const asStrings = (v: unknown): string[] | null =>
  Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : null;

/** 3 short, surprising, true fun facts about the delivery city. */
export async function generateCityFacts(city: string, country: string): Promise<string[] | null> {
  const out = await chatJSON(
    `Return JSON {"facts": string[]} with exactly 3 short, true, surprising fun facts about ${city}, ${country}. ` +
      `Each fact under 24 words, friendly, no preamble, no repetition.`
  );
  return out ? asStrings(out.facts) : null;
}

/** 3 "did you know" style facts/benefits about the brand. */
export async function generateBrandFacts(
  brandName: string,
  description?: string | null
): Promise<string[] | null> {
  const out = await chatJSON(
    `Return JSON {"facts": string[]} with exactly 3 short "did you know" style facts or benefits about the brand "${brandName}". ` +
      (description ? `Context about the brand: ${description}. ` : "") +
      `Each under 24 words, warm and trustworthy, for a customer who just ordered. No preamble.`
  );
  return out ? asStrings(out.facts) : null;
}

export type UpsellRec = { forItem: string; name: string; blurb: string };

/** For each ordered item, pick the best-matching add-on from the catalog + a one-line reason. */
export async function recommendUpsells(
  orderedTitles: string[],
  catalogTitles: string[]
): Promise<UpsellRec[] | null> {
  const out = await chatJSON(
    `A shopper ordered these items: ${JSON.stringify(orderedTitles)}. ` +
      `The store's catalog is: ${JSON.stringify(catalogTitles)}. ` +
      `For EACH ordered item pick the single best complementary add-on from the catalog (must be an exact catalog title, and different from the ordered item). ` +
      `Return JSON {"recs": [{"forItem": string, "name": string, "blurb": string}]} where blurb is a friendly one-line reason the two pair well, under 26 words.`
  );
  const recs = out?.recs;
  if (!Array.isArray(recs)) return null;
  return recs.filter(
    (r): r is UpsellRec =>
      r && typeof r.forItem === "string" && typeof r.name === "string" && typeof r.blurb === "string"
  );
}

/**
 * Generate a high-quality hero image for the brand. Returns a data URL (base64 PNG)
 * the caller can render or save. Slow + costs money, so call sparingly (cache it).
 */
export async function generateHeroImage(
  brandName: string,
  hint?: string
): Promise<string | null> {
  // Images are the costly call, so they need aiEnabled() AND an explicit opt-in.
  if (!aiEnabled() || process.env.AI_IMAGES !== "true") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt:
          `A premium, editorial lifestyle hero photograph for the brand "${brandName}". ` +
          (hint ? `Products: ${hint}. ` : "") +
          `Natural light, clean modern composition, high-end e-commerce campaign look, no text, no logos, ultra sharp.`,
        size: "1536x1024",
        quality: "high",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
