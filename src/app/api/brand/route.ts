import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileP = promisify(execFile);

export const runtime = "nodejs";
export const maxDuration = 60; // sequential Jina fallbacks (Cloudflare bypass) can take a while

type DemoProductOut = {
  id: string;
  title: string;
  variant: string;
  price: number;
  qty: number;
  image: string | null;
  variants: { title: string; price: number }[];
};

type Branding = {
  brandName: string | null;
  brandColor: string | null;
  logo: string | null;
  ogImage: string | null; // wide brand photo (for hero/promo)
  bannerImage: string | null; // best-guess wide lifestyle/banner image for the hero
  url: string | null; // the store's homepage (for CTA links)
  currency: string | null;
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  products: DemoProductOut[];
};

// Curated accent colors for brands whose sites don't expose a usable theme-color.
const CURATED_COLORS: [RegExp, string][] = [
  [/newtonbaby/i, "#1fb189"],
  [/thirdlove/i, "#2c272d"],
  [/armani/i, "#111111"],
  [/pehr/i, "#597c7c"],
];

// Store currency -> the country + a famous city there (with coords + timezone).
type Locale = { country: string; city: string; lat: number; lon: number; tz: string };
const LOCALE_BY_CURRENCY: Record<string, Locale> = {
  INR: { country: "India", city: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  USD: { country: "United States", city: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  GBP: { country: "United Kingdom", city: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  EUR: { country: "France", city: "Paris", lat: 48.8566, lon: 2.3522, tz: "Europe/Paris" },
  CAD: { country: "Canada", city: "Toronto", lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
  AUD: { country: "Australia", city: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
  AED: { country: "United Arab Emirates", city: "Dubai", lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
  SGD: { country: "Singapore", city: "Singapore", lat: 1.3521, lon: 103.8198, tz: "Asia/Singapore" },
  JPY: { country: "Japan", city: "Tokyo", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  NZD: { country: "New Zealand", city: "Auckland", lat: -36.8485, lon: 174.7633, tz: "Pacific/Auckland" },
  ZAR: { country: "South Africa", city: "Cape Town", lat: -33.9249, lon: 18.4241, tz: "Africa/Johannesburg" },
  BRL: { country: "Brazil", city: "Sao Paulo", lat: -23.5505, lon: -46.6333, tz: "America/Sao_Paulo" },
  SAR: { country: "Saudi Arabia", city: "Riyadh", lat: 24.7136, lon: 46.6753, tz: "Asia/Riyadh" },
};
const DEFAULT_LOCALE: Locale = LOCALE_BY_CURRENCY.USD;

/** Best-effort currency from the domain TLD, when the store doesn't expose one. */
function currencyFromTld(host: string): string | null {
  const h = host.toLowerCase();
  const map: [RegExp, string][] = [
    [/\.in$/, "INR"],
    [/\.(co\.uk|uk)$/, "GBP"],
    [/\.(com\.au|au)$/, "AUD"],
    [/\.ca$/, "CAD"],
    [/\.(de|fr|it|es|nl|ie|eu|pt|at|be|fi)$/, "EUR"],
    [/\.sg$/, "SGD"],
    [/\.ae$/, "AED"],
    [/\.jp$/, "JPY"],
    [/\.nz$/, "NZD"],
    [/\.za$/, "ZAR"],
    [/\.br$/, "BRL"],
    [/\.sa$/, "SAR"],
  ];
  for (const [re, cur] of map) if (re.test(h)) return cur;
  return null;
}

/** Reject near-white theme colors (invisible on white cards). */
function isTooLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return false;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.82;
}

// --- simple in-memory cache (per server instance) ---
const cache = new Map<string, { data: Branding; at: number }>();
const TTL = 1000 * 60 * 30; // 30 min

const FETCH_TIMEOUT = 4500;
const MAX_BYTES = 600_000; // cap HTML we read

// Many stores (Cloudflare/WAF) block generic bot User-Agents — even for the
// public /products.json — so present as a real browser to read public data.
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Reject obviously-internal / non-public hosts (basic SSRF guard). */
function isBlockedHost(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (!h.includes(".")) return true; // must look like a real domain
  // raw IP literals -> block private / reserved ranges
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {
    const p = h.split(".").map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true; // link-local / cloud metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    return false;
  }
  if (h.includes(":")) return true; // IPv6 literal -> block to be safe
  return false;
}

function normalizeUrl(raw: string): URL | null {
  try {
    const trimmed = raw.trim().replace(/^https?:\/\//i, "");
    const url = new URL(`https://${trimmed}`);
    if (url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

/** True when a response body is a Cloudflare/WAF challenge instead of real content. */
function isChallenge(text: string): boolean {
  return /Just a moment|challenge-platform|cf-browser-verification|Attention Required/i.test(text.slice(0, 2500));
}

/** Read a capped amount of the body (whole for JSON; up to </head> for HTML). */
async function readCapped(res: Response, htmlHead: boolean): Promise<string | null> {
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (total > MAX_BYTES || (htmlHead && /<\/head>/i.test(out))) break;
  }
  reader.cancel().catch(() => {});
  return out;
}

async function tryFetch(url: string, accept: string, htmlHead: boolean): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { ...BROWSER_HEADERS, Accept: accept },
    });
    const text = await readCapped(res, htmlHead);
    if (text && isChallenge(text)) return null; // let curl handle it
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fallback via the system `curl` — many Shopify stores sit behind Cloudflare,
 * which fingerprints and blocks Node/undici (returns a "Just a moment" 403) but
 * lets curl through, so we can still read the public /products.json + branding.
 */
async function curlFetch(url: string, accept: string): Promise<string | null> {
  try {
    const { stdout } = await execFileP(
      "curl",
      [
        "-sL",
        "--max-redirs", "5",
        "--max-time", String(Math.ceil(FETCH_TIMEOUT / 1000) + 4),
        "-A", BROWSER_HEADERS["User-Agent"],
        "-H", `Accept: ${accept}`,
        "-H", `Accept-Language: ${BROWSER_HEADERS["Accept-Language"]}`,
        url,
      ],
      { maxBuffer: MAX_BYTES + 200_000, timeout: FETCH_TIMEOUT + 6000 }
    );
    if (!stdout || isChallenge(stdout)) return null;
    return stdout;
  } catch {
    return null;
  }
}

/**
 * Fallback via Jina AI Reader (r.jina.ai) — a public reader that fetches with a
 * real headless browser, so it bypasses Cloudflare from ANY server (works on
 * Vercel where `curl` isn't available / the datacenter IP is blocked).
 * `format: "html"` returns raw HTML (for branding); default returns text/markdown
 * (the JSON body is embedded, so callers extract it).
 */
// Optional Jina API key — unauthenticated r.jina.ai is rate-limited per IP, which
// Vercel's shared datacenter IPs hit quickly (causing WAF-protected stores to fall
// back to the sample). A free key (jina.ai/reader) raises the limit dramatically.
const JINA_KEY = process.env.JINA_API_KEY;

async function jinaFetch(url: string, format?: "html"): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT + 12000);
  try {
    const headers: Record<string, string> = { "User-Agent": BROWSER_HEADERS["User-Agent"] };
    if (format) headers["X-Return-Format"] = format;
    if (JINA_KEY) headers["Authorization"] = `Bearer ${JINA_KEY}`;
    const res = await fetch(`https://r.jina.ai/${url}`, { signal: controller.signal, headers });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || isChallenge(text)) return null;
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Pull the JSON object out of a raw/wrapped response (Jina embeds it in markdown). */
function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
}

function safeJson(raw: string | null): unknown | null {
  if (!raw) return null;
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return null;
  }
}

/** Fast path only (Node + curl) — no Jina, so these can safely run concurrently. */
async function directText(url: string, htmlHead = true): Promise<string | null> {
  return (
    (await tryFetch(url, "text/html,application/xhtml+xml", htmlHead)) ??
    (await curlFetch(url, "text/html,application/xhtml+xml"))
  );
}

async function directJson(url: string): Promise<unknown | null> {
  return safeJson(
    (await tryFetch(url, "application/json", false)) ?? (await curlFetch(url, "application/json"))
  );
}

/** Jina-only (headless browser proxy) — used sequentially as a last resort. */
async function jinaJson(url: string): Promise<unknown | null> {
  return safeJson(await jinaFetch(url));
}

type ShopifyProduct = {
  id?: number | string;
  handle?: string;
  title?: string;
  vendor?: string;
  variants?: { title?: string; price?: string | number }[];
  images?: { src?: string }[];
};

/** Brand name from a products.json vendor field — fallback when the homepage is unreadable. */
function vendorFrom(json: unknown): string | null {
  const arr =
    json && typeof json === "object" && Array.isArray((json as { products?: unknown }).products)
      ? (json as { products: ShopifyProduct[] }).products
      : [];
  const v = arr.find((p) => p.vendor && p.vendor.trim())?.vendor?.trim();
  return v || null;
}

function parseProducts(json: unknown): DemoProductOut[] {
  const arr =
    json && typeof json === "object" && Array.isArray((json as { products?: unknown }).products)
      ? ((json as { products: ShopifyProduct[] }).products)
      : [];
  return arr
    .slice(0, 8)
    .map((p) => {
      const v = p.variants?.[0];
      const variant = v?.title && v.title !== "Default Title" ? v.title : "";
      const price = Math.round(Number(v?.price ?? 0)) || 0;
      const image = p.images?.[0]?.src ?? null;
      const variants = (p.variants ?? [])
        .map((vv) => ({
          title: vv?.title && vv.title !== "Default Title" ? vv.title : "Default",
          price: Math.round(Number(vv?.price ?? 0)) || price,
        }))
        .filter((vv) => vv.title !== "Default" || (p.variants ?? []).length === 1);
      return {
        id: String(p.id ?? p.handle ?? Math.random()),
        title: String(p.title ?? "Product"),
        variant,
        price,
        qty: 1,
        image,
        variants,
      };
    })
    .filter((p) => p.title && p.title !== "Product");
}

// --- JSON-LD / schema.org product parsing --------------------------------
// Non-Shopify stores (WooCommerce, BigCommerce, custom) don't expose
// /products.json, but many embed schema.org Product / ItemList markup in
// <script type="application/ld+json"> on the homepage. Parse that as a fallback
// so the demo shows real products for those stores too.

/** Collect every JSON-LD node in the HTML, flattening arrays and @graph containers. */
function collectJsonLdNodes(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue; // ignore malformed block
    }
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    for (const n of nodes) {
      if (!n || typeof n !== "object") continue;
      const node = n as Record<string, unknown>;
      const graph = node["@graph"];
      if (Array.isArray(graph)) {
        for (const g of graph) if (g && typeof g === "object") out.push(g as Record<string, unknown>);
      } else {
        out.push(node);
      }
    }
  }
  return out;
}

function typeMatches(t: unknown, name: string): boolean {
  const target = name.toLowerCase();
  if (typeof t === "string") return t.toLowerCase().endsWith(target);
  if (Array.isArray(t)) return t.some((x) => typeof x === "string" && x.toLowerCase().endsWith(target));
  return false;
}

function jsonLdImage(node: Record<string, unknown>, base: URL): string | null {
  const img = node.image;
  let raw: string | null = null;
  if (typeof img === "string") raw = img;
  else if (Array.isArray(img) && img.length) {
    raw = typeof img[0] === "string" ? img[0] : ((img[0] as Record<string, unknown>)?.url as string) ?? null;
  } else if (img && typeof img === "object") {
    raw = ((img as Record<string, unknown>).url as string) ?? null;
  }
  return absolutize(raw, base);
}

function jsonLdPrice(node: Record<string, unknown>): number {
  const offers = node.offers;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  if (offer && typeof offer === "object") {
    const o = offer as Record<string, unknown>;
    const p = o.price ?? o.lowPrice ?? (o.priceSpecification as Record<string, unknown> | undefined)?.price;
    return Math.round(Number(p)) || 0;
  }
  return 0;
}

function jsonLdToProduct(node: Record<string, unknown>, base: URL): DemoProductOut | null {
  const name = typeof node.name === "string" ? decodeHtml(node.name.trim()) : "";
  if (!name) return null;
  const id =
    (typeof node.sku === "string" && node.sku) ||
    (typeof node.url === "string" && node.url) ||
    name;
  return {
    id: String(id),
    title: name,
    variant: "",
    price: jsonLdPrice(node),
    qty: 1,
    image: jsonLdImage(node, base),
    variants: [],
  };
}

function parseJsonLdProducts(html: string, base: URL): DemoProductOut[] {
  const nodes = collectJsonLdNodes(html);
  const products: DemoProductOut[] = [];
  for (const node of nodes) {
    const t = node["@type"];
    if (typeMatches(t, "Product")) {
      const p = jsonLdToProduct(node, base);
      if (p) products.push(p);
    } else if (typeMatches(t, "ItemList")) {
      const items = node.itemListElement;
      if (!Array.isArray(items)) continue;
      for (const it of items) {
        if (!it || typeof it !== "object") continue;
        const item = ((it as Record<string, unknown>).item ?? it) as Record<string, unknown>;
        if (typeMatches(item["@type"], "Product")) {
          const p = jsonLdToProduct(item, base);
          if (p) products.push(p);
        }
      }
    }
  }
  // dedupe by title, cap at 8
  const seen = new Set<string>();
  return products
    .filter((p) => {
      const k = p.title.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8);
}

/**
 * Last-resort product scrape straight from the homepage markup for stores that are
 * neither Shopify nor JSON-LD-rich. Treats each anchor that contains BOTH an image
 * and a price as a product card and pulls out image + title + price.
 */
function productsFromHtmlCards(html: string, base: URL): DemoProductOut[] {
  const out: DemoProductOut[] = [];
  const seen = new Set<string>();
  const priceRe = /(?:[$₹£€]|Rs\.?|USD|INR|AUD|CAD|GBP|EUR)\s?([0-9][0-9.,]*)/i;
  const anchorRe = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) && out.length < 8) {
    const block = m[0];
    const imgM = block.match(/<img[^>]+(?:data-src|srcset|src)=["']([^"']+)["']/i);
    const priceM = block.match(priceRe);
    if (!imgM || !priceM) continue;
    const rawImg = imgM[1].split(",")[0].trim().split(/\s+/)[0];
    const image = absolutize(rawImg.replace(/&amp;/gi, "&"), base);
    if (!image || /\.svg(\?|$)|sprite|icon|logo|placeholder/i.test(image)) continue;
    const alt = block.match(/<img[^>]+alt=["']([^"']+)["']/i)?.[1];
    let title = (alt || block.replace(/<[^>]+>/g, " "))
      .replace(priceRe, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
    const price = Math.round(parseFloat(priceM[1].replace(/,/g, "")) || 0);
    if (!title || title.length < 3 || price <= 0) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: String(out.length + 1),
      title: decodeHtml(title),
      variant: "",
      price,
      qty: 1,
      image,
      variants: [{ title: "Default", price }],
    });
  }
  return out;
}

/** Homepage logo image (header <img> whose src/alt/class mentions "logo"). */
function logoFromHtml(html: string, base: URL): string | null {
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgTags) {
    if (!/logo/i.test(tag)) continue;
    if (/sprite|payment|footer|badge|icon-/i.test(tag)) continue;
    const src =
      tag.match(/(?:data-src|src)=["']([^"']+)["']/i)?.[1] ||
      tag.match(/srcset=["']([^",\s]+)/i)?.[1];
    if (!src) continue;
    const abs = absolutize(src.replace(/&amp;/gi, "&"), base);
    if (abs && !/\.svg(\?|$)/i.test(abs)) return abs;
    if (abs) return abs; // allow SVG logos too
  }
  return null;
}

function metaContent(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtml(m[1].trim());
  }
  return null;
}

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function absolutize(href: string | null, base: URL): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Upgrade a logo/image URL to a crisp, larger version. Shopify (and many other
 * CDNs) accept a `width`/`height` query param — favicons/apple-touch-icons come
 * back tiny (e.g. 180×180), which looks pixelated/blurry when shown large. Bump
 * the width and drop height/crop so it scales up sharp with the aspect preserved.
 */
function upscaleImage(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.searchParams.has("width") || u.searchParams.has("height")) {
      u.searchParams.set("width", "600");
      u.searchParams.delete("height");
      u.searchParams.delete("crop");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

// Site metadata sometimes yields a useless "brand" (a page title like "Home",
// or literally "Me") — fall back to the domain name in those cases.
const GENERIC_NAMES = new Set(["me", "home", "shop", "store", "index", "welcome", "page", "cart"]);
// Error / placeholder / challenge page titles that must NEVER become the "brand" —
// stores occasionally serve these (or the fetch briefly caught an error/maintenance
// page), and we'd rather fall back to the domain name than show "Something went wrong".
const BAD_TITLE_RE =
  /^(something went wrong|error|oops|internal server error|page not found|not found|404|403|500|access denied|forbidden|unauthorized|just a moment|attention required|checking your browser|service unavailable|temporarily unavailable|site (temporarily )?unavailable|under (construction|maintenance)|maintenance|coming soon|website expired|domain (for sale|expired|parked)|bad gateway|gateway timeout)\b/i;
// Bot-check / anti-scraping interstitials (Google reCAPTCHA, Amazon "Robot Check",
// etc.) leak into the <title>/og:site_name as e.g. "Flipkart reCAPTCHA" — reject if
// these appear ANYWHERE in the name, then fall back to the clean domain name.
const CHALLENGE_RE =
  /recaptcha|captcha|are you (a )?(human|robot)|robot check|attention required|access denied|just a moment|verify you are (a )?human|unusual traffic|enable (javascript|cookies)/i;
function isUsableName(s: string | null | undefined): s is string {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 2) return false;
  if (GENERIC_NAMES.has(t.toLowerCase())) return false;
  if (BAD_TITLE_RE.test(t)) return false;
  if (CHALLENGE_RE.test(t)) return false;
  return true;
}

// Brand names are short. A long descriptive <title> (e.g. "Post-Surgery Bras for
// Your Unique Body Type at AnaOno") is not a brand — reject it so we fall back to
// the domain name instead of a stray title fragment.
function isBrandLike(s: string): boolean {
  const t = s.trim();
  return t.length <= 30 && t.split(/\s+/).length <= 4;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** HSL saturation + lightness (0..1) for filtering out grays and near white/black. */
function satLight({ r, g, b }: { r: number; g: number; b: number }): { s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

/**
 * Fallback accent extractor: count every 6-digit hex in the markup, drop grays and
 * near white/black, and return the most frequent reasonably-saturated color (nudged
 * by saturation). This surfaces a store's real button/link/accent color when no
 * usable theme-color meta is declared.
 */
function pickAccentFromHtml(html: string): string | null {
  const counts = new Map<string, number>();
  const re = /#([0-9a-f]{6})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const c = "#" + m[1].toLowerCase();
    counts.set(c, (counts.get(c) || 0) + 1);
  }
  let best: string | null = null;
  let bestScore = 0;
  for (const [c, n] of counts) {
    const { s, l } = satLight(hexToRgb(c));
    if (l > 0.9 || l < 0.12) continue; // skip near-white / near-black
    if (s < 0.22) continue; // skip grays / very muted
    if (isTooLight(c)) continue;
    const score = n * (0.5 + s); // frequency, weighted up by saturation
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

function parseBranding(
  html: string,
  base: URL
): Pick<Branding, "brandName" | "brandColor" | "logo" | "ogImage" | "bannerImage"> {
  // Prefer og:site_name (a clean brand). Otherwise take the first segment of the
  // <title>, but only split on separators surrounded by whitespace or a pipe/dash —
  // NOT a bare hyphen, so "Post-Surgery Bras … at AnaOno" doesn't become "Post".
  const ogName = metaContent(html, [
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
  ]);
  const titleName = metaContent(html, [/<title[^>]*>([^<]+)<\/title>/i])
    ?.split(/\s*[|–—]\s*|\s+-\s+/)[0]
    ?.trim();
  const domainName = base.hostname.replace(/^www\./, "").split(".")[0];
  const siteName = isUsableName(ogName)
    ? ogName
    : isUsableName(titleName) && isBrandLike(titleName)
      ? titleName
      : domainName;

  // Accent color: prefer declared meta colors (theme-color, then MS tile color); if
  // those are missing/white/too-light, fall back to the most frequent vivid color in
  // the page's markup (usually the brand's button/link/accent color).
  const themeColor = metaContent(html, [
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i,
  ]);
  const tileColor = metaContent(html, [
    /<meta[^>]+name=["']msapplication-TileColor["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']msapplication-TileColor["']/i,
  ]);
  const normHex = (v: string | null | undefined): string | null => {
    if (!v) return null;
    const t = v.trim();
    return /^#?[0-9a-f]{3,8}$/i.test(t.replace("#", "")) ? (t.startsWith("#") ? t : `#${t}`) : null;
  };
  let brandColor: string | null = null;
  for (const cand of [normHex(themeColor), normHex(tileColor)]) {
    if (cand && !isTooLight(cand)) {
      brandColor = cand;
      break;
    }
  }
  if (!brandColor) brandColor = pickAccentFromHtml(html);

  // Wide brand photo (used for the hero/promo imagery), separate from the logo.
  const ogImage = absolutize(
    metaContent(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ]),
    base
  );

  // Prefer a real header logo <img>; then apple-touch-icon; then og:image; then favicon.
  const htmlLogo = logoFromHtml(html, base);
  const iconHref =
    metaContent(html, [
      /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon[^"']*["']/i,
    ]) ||
    metaContent(html, [/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i]) ||
    metaContent(html, [
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    ]);

  return {
    brandName: siteName ? capitalize(siteName) : null,
    brandColor,
    logo: htmlLogo || upscaleImage(absolutize(iconHref, base)),
    ogImage,
    bannerImage: pickBannerImage(html, base),
  };
}

/**
 * Best-guess wide banner / lifestyle image from the homepage for the hero — real
 * marketing imagery reads far better than a square product shot. Collects <img>
 * (incl. srcset) + CSS background images, scores by banner-ish signals, and returns
 * the top candidate (or null → the hero falls back to og:image / a product photo).
 */
function pickBannerImage(html: string, base: URL): string | null {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi)) urls.add(m[1]);
  for (const m of html.matchAll(/<(?:img|source)[^>]+srcset=["']([^"']+)["']/gi)) {
    const last = m[1]
      .split(",")
      .map((s) => s.trim().split(/\s+/)[0])
      .filter(Boolean)
      .pop();
    if (last) urls.add(last);
  }
  for (const m of html.matchAll(/background-image\s*:\s*url\((["']?)([^)"']+)\1\)/gi)) urls.add(m[2]);

  const score = (u: string): number => {
    const s = u.toLowerCase();
    let sc = 0;
    if (/hero|banner|lifestyle|slide|homepage|header|cover|campaign|billboard|hp[_-]/.test(s)) sc += 6;
    if (/\b(1600|1800|1920|2000|2400|2560|3000)\b/.test(s) || /width=1[5-9]\d\d|width=2\d{3}/.test(s)) sc += 3;
    if (/product|thumbnail|thumb|icon|logo|favicon|badge|sprite|swatch|\/products\//.test(s)) sc -= 6;
    if (/\.svg(\?|$)/.test(s) || /placeholder|blank|loading|pixel/.test(s)) sc -= 6;
    return sc;
  };

  let best: string | null = null;
  let bestScore = 0;
  for (const u of urls) {
    // Decode HTML entities (e.g. &amp; in srcset/attr URLs) so the image URL is valid.
    const abs = absolutize(u.replace(/&amp;/gi, "&").replace(/&#38;/g, "&"), base);
    if (!abs) continue;
    const sc = score(abs);
    if (sc > bestScore) {
      bestScore = sc;
      best = abs;
    }
  }
  return bestScore >= 4 ? best : null;
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function parseCurrency(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const c = (json as Record<string, unknown>).currency;
  if (typeof c === "string" && /^[A-Z]{3}$/.test(c)) return c;
  return null;
}

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const url = normalizeUrl(body.url || "");
  if (!url) {
    return NextResponse.json({ error: "Invalid or blocked URL" }, { status: 400 });
  }

  const key = url.hostname;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json(hit.data);
  }

  const productsUrl = `${url.origin}/products.json?limit=8`;
  const collectionsUrl = `${url.origin}/collections/all/products.json?limit=8`;

  // Phase 1 — fast path (Node + curl), concurrent, NO Jina. Handles every store
  // that isn't behind a Node-blocking WAF, with zero rate-limited requests.
  const [directHtml, directPj, cartJson] = await Promise.all([
    directText(url.toString(), false),
    directJson(productsUrl),
    directJson(`${url.origin}/cart.js`),
  ]);
  let html = directHtml;
  let productsJson = directPj;

  let products = parseProducts(productsJson);
  // Secondary Shopify path (still fast/direct) — some stores 404 /products.json.
  if (products.length === 0) {
    const alt = await directJson(collectionsUrl);
    products = parseProducts(alt);
    if (products.length > 0) productsJson = alt;
  }

  // Phase 2 — Jina fallback (WAF-protected stores). Sequential + products FIRST so
  // the important call isn't starved by a concurrent branding call under rate limits.
  if (products.length === 0) {
    productsJson = await jinaJson(productsUrl);
    products = parseProducts(productsJson);
  }
  if (products.length === 0) {
    const alt = await jinaJson(collectionsUrl);
    products = parseProducts(alt);
    if (products.length > 0) productsJson = alt;
  }
  if (!html) {
    html = await jinaFetch(url.toString(), "html");
  }
  // Non-Shopify stores — pull schema.org/JSON-LD products from the homepage.
  if (products.length === 0 && html) {
    products = parseJsonLdProducts(html, url);
  }
  // Last resort — scrape product cards directly from the homepage markup.
  if (products.length === 0 && html) {
    products = productsFromHtmlCards(html, url);
  }

  const currency = parseCurrency(cartJson);

  // Never hard-fail: even when a store blocks us entirely (no readable homepage and
  // no products — e.g. Flipkart/Amazon-style bot walls), we still return the brand
  // name (from the domain) + a favicon fallback below, and the client fills in the
  // sample catalog. The demo should always render a branded preview, never an error.
  const branding = html
    ? parseBranding(html, url)
    : {
        // No homepage: use the products' vendor, else the domain name.
        brandName:
          vendorFrom(productsJson) || capitalize(url.hostname.replace(/^www\./, "").split(".")[0]),
        brandColor: null,
        logo: null,
        ogImage: null,
        bannerImage: null,
      };

  // Curated accent colors win over (or fill in) the scraped theme-color.
  const curated = CURATED_COLORS.find(([re]) => re.test(url.hostname));
  if (curated) branding.brandColor = curated[1];

  // Country + famous city from the store's currency (falls back to the TLD, then US).
  const cur = currency || currencyFromTld(url.hostname);
  const locale = (cur && LOCALE_BY_CURRENCY[cur]) || DEFAULT_LOCALE;

  // Always have a logo: when we couldn't extract the apple-touch-icon (e.g. a
  // Cloudflare/bot-protected store whose homepage HTML we couldn't read), fall back
  // to Google's favicon service — it resolves the real favicon for far more hosts
  // than DuckDuckGo (which 404s to a gray-chevron placeholder for big sites like
  // flipkart.com), so the browser bar shows the brand icon, never a broken glyph.
  if (!branding.logo) {
    branding.logo = `https://www.google.com/s2/favicons?domain=${url.hostname.replace(/^www\./, "")}&sz=256`;
  }

  const data: Branding = {
    ...branding,
    url: url.origin,
    currency,
    country: locale.country,
    city: locale.city,
    lat: locale.lat,
    lon: locale.lon,
    timezone: locale.tz,
    products,
  };
  cache.set(key, { data, at: Date.now() });
  return NextResponse.json(data);
}
