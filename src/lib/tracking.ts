/**
 * Tracking demo data. Real products come from the store's catalog (via /api/brand);
 * the sample arrays below are the fallback when a store's catalog can't be read.
 */
import type { Product } from "./site";

/** Estimated delivery = a couple of days out from now, formatted for the EDD card. */
export function estimatedDelivery(now: Date = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + 2);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }), // "Sat"
    month: d.toLocaleDateString("en-US", { month: "long" }), // "July"
    day: d.getDate(), // 25
  };
}

/** Current local time at the shipment's location, e.g. "Today at 9:00 pm". */
export function localTimeLabel(timezone: string | null, now: Date = new Date()) {
  try {
    const t = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone || undefined,
    });
    return `Today at ${t.toLowerCase()}`;
  } catch {
    return "Today";
  }
}

export const orderMock = {
  status: "On The Way",
  statusBadge: "Running Timely",
  latestUpdateTimeLabel: "Today, 8 PM",
};

// ---- Shipment journey ----
export type JourneyState = "done" | "active" | "upcoming";
export type ScanDetail = { location: string; time: string; remarks: string };
export type JourneyStep = {
  label: string;
  place: string; // "City · Day Date, Time" — {city} is replaced with the live city
  state: JourneyState;
  details?: ScanDetail[]; // scan history shown under the active step
};

const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" });
const fmtTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

/** Build the shipment timeline with dates relative to today (order is "in transit" now). */
export function buildJourneySteps(city: string, now: Date = new Date()): JourneyStep[] {
  const at = (offsetDays: number, h: number, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const placed = at(-2, 16);
  const dispatched = at(-1, 17);
  const transit = at(0, 20);
  const transit2 = at(0, 16);
  const ofd = at(1, 9);
  const delivered = at(2, 18);
  return [
    { label: "Order Placed", place: `Fulfillment Center · ${fmtDate(placed)}, ${fmtTime(placed)}`, state: "done" },
    { label: "Dispatched", place: `Fulfillment Center · ${fmtDate(dispatched)}, ${fmtTime(dispatched)}`, state: "done" },
    {
      label: "In Transit",
      place: `${city} · ${fmtDate(transit)}, ${fmtTime(transit)}`,
      state: "active",
      details: [
        { location: city, time: `${fmtDate(transit)}, ${fmtTime(transit)}`, remarks: `Received at ${city} Hub` },
        { location: city, time: `${fmtDate(transit2)}, ${fmtTime(transit2)}`, remarks: `Received at ${city} Airport` },
      ],
    },
    { label: "Out For Delivery", place: `Expected ${fmtDate(ofd)}`, state: "upcoming" },
    { label: "Delivered", place: `Estimated ${fmtDate(delivered)}`, state: "upcoming" },
  ];
}

// ---- Order items (with Style / Care / Usage tips) ----
/** Unsplash CDN helper (loads client-side in the browser). */
const UIMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

/** Full-bleed lifestyle hero photo — fallback when the store has no og:image/product image. */
export const heroImage = UIMG("1483985988355-763728e1935b");

/** Vertical promo image for the bottom of the right rail. */
export const promoImage = UIMG("1490481651871-ab68de25d43d");

export type ItemRec = { name: string; blurb: string; image: string };
export type OrderItem = {
  name: string;
  variant: string;
  qty: number;
  price: number;
  image: string;
  styleTip: string;
  careTip: string;
  usageTip: string;
  rec: ItemRec | null; // No upsell when there is no distinct paid product.
};

const SAMPLE_ORDER_ITEMS: OrderItem[] = [
  {
    name: "Everyday Cotton Tee",
    variant: "Black · M",
    qty: 1,
    price: 38,
    image: UIMG("1521572163474-6864f9cf17ab"),
    styleTip: "Pair it with relaxed chinos and clean sneakers for an easy, put-together everyday look.",
    careTip: "Machine wash cold and tumble dry low to keep the fabric soft and true to size.",
    usageTip: "Layer it under a jacket or wear it solo, a versatile staple for any season.",
    rec: {
      name: "Relaxed Chino Pants",
      blurb: "Soft, breathable stretch-cotton chinos that pair with everything in your rotation.",
      image: UIMG("1624378439575-d8705ad7ae80"),
    },
  },
  {
    name: "Canvas Low-Top Sneakers",
    variant: "Off-White · 9",
    qty: 1,
    price: 72,
    image: UIMG("1542291026-7eec264c27ff"),
    styleTip: "Keep it clean and casual with cuffed denim and a crew tee.",
    careTip: "Spot-clean with a damp cloth and air-dry away from direct heat to protect the canvas.",
    usageTip: "Great for daily wear, travel, and weekend outings.",
    rec: {
      name: "No-Show Sock 3-Pack",
      blurb: "Cushioned, breathable no-show socks designed to stay put inside low-tops.",
      image: UIMG("1586350977771-b3b0abd50c82"),
    },
  },
];

// ---- New arrivals ----
export type ArrivalProduct = { name: string; price: number; image: string };
const SAMPLE_NEW_ARRIVALS: ArrivalProduct[] = [
  { name: "Merino Wool Beanie", price: 28, image: UIMG("1607522370275-f14206abe5d3") },
  { name: "Everyday Canvas Tote", price: 34, image: UIMG("1591561954557-26941169b49e") },
  { name: "Ribbed Crew Socks (3-pack)", price: 18, image: UIMG("1583743814966-8936f5b7be1a") },
  { name: "Relaxed Fleece Hoodie", price: 68, image: UIMG("1556821840-3a63f95609a7") },
  { name: "Leather Card Holder", price: 45, image: UIMG("1627123424574-724758594e93") },
  { name: "Everyday Cotton Tee", price: 38, image: UIMG("1521572163474-6864f9cf17ab") },
  { name: "Canvas Low-Top Sneakers", price: 72, image: UIMG("1542291026-7eec264c27ff") },
  { name: "Relaxed Chino Pants", price: 58, image: UIMG("1624378439575-d8705ad7ae80") },
];

// Match fee/label entries, not merchandise such as "Shipping Box" or "Return Shipping Kit".
const SHIPPING_SERVICE_TITLE = /^(?:(?:return\s+)?shipping(?:\s+(?:fee|charge|cost|label))?|return\s+(?:postage|label))$/i;

/** Exclude free gifts, invalid prices and shipping services from demo merchandise. */
export function getPaidProducts(products: Product[]): Product[] {
  return products.filter((p) =>
    Number.isFinite(p.price) && p.price > 0 && !SHIPPING_SERVICE_TITLE.test(p.title.trim())
  );
}

type UpsellPick = { forItem: string; name: string; blurb: string };

/** Build demo orders and paid recommendations; only missing catalogs use samples. */
export function buildOrderItems(products: Product[], upsells?: UpsellPick[] | null): OrderItem[] {
  if (products.length === 0) return SAMPLE_ORDER_ITEMS;
  const paid = getPaidProducts(products);
  return paid.slice(0, 2).map((p, i) => {
    const candidates = paid.filter((candidate) => candidate.id !== p.id);
    const recIdx = paid.length > 2 ? i + 2 : (i + 1) % paid.length;
    const preferred = paid[recIdx];
    let rec = candidates.find((candidate) => candidate === preferred) ?? candidates[0];
    let blurb = "A perfect match to round out your order, hand-picked to pair with your pick.";

    // Cached/generated names must still resolve to one distinct, paid product.
    const pick = upsells?.find((u) => u.forItem === p.title);
    if (pick) {
      const matches = products.filter((candidate) => candidate.title === pick.name);
      if (matches.length === 1 && candidates.includes(matches[0])) {
        rec = matches[0];
        blurb = pick.blurb || blurb;
      }
    }

    return {
      name: p.title,
      variant: p.variant || "Standard",
      qty: p.qty || 1,
      price: p.price,
      image: p.image || SAMPLE_ORDER_ITEMS[0].image,
      styleTip: "A versatile pick that layers easily and works for any occasion.",
      careTip: "Follow the care label; a gentle cold wash keeps it looking new for longer.",
      usageTip: "",
      rec: rec ? {
        name: rec.title,
        blurb,
        image: rec.image || SAMPLE_ORDER_ITEMS[0].rec?.image || "",
      } : null,
    };
  });
}

/** Build paid New Arrivals; don't substitute samples for an all-free catalog. */
export function buildNewArrivals(products: Product[]): ArrivalProduct[] {
  if (products.length === 0) return SAMPLE_NEW_ARRIVALS;
  const paid = getPaidProducts(products);
  // Keep new picks first, then include products already shown in the order above.
  const src = [...paid.slice(2), ...paid.slice(0, 2)];
  return src.slice(0, 10).map((p) => ({ name: p.title, price: p.price, image: p.image || "" }));
}

// ---- Order details ----
export const orderDetails = {
  orderId: "8998372778923",
  trackingId: "7578302288971",
  carrier: "FedEx",
  orderType: "Prepaid",
  orderDate: "Tue, 1st July",
  orderValue: "$110",
};

// ---- Curated facts (static for now; a real AI source can drop in later) ----
const CITY_FACTS: Record<string, string> = {
  "New York":
    "New York City is home to over 800 languages spoken by its residents, making it one of the most linguistically diverse cities in the world.",
  "Austin": "Austin is the live-music capital of the world, with more venues per capita than any other US city.",
  "San Francisco": "San Francisco's cable cars are the only moving National Historic Landmark in the US.",
  "Chicago": "Chicago gave the world the first-ever skyscraper, built in 1885.",
  "Los Angeles": "Los Angeles is the only North American city to have hosted the Summer Olympics twice (soon to be three times).",
};

const CITY_FACTS_EXTRA: Record<string, string[]> = {
  "New York": [
    "Central Park is larger than the entire country of Monaco.",
    "The New York City subway has 472 stations, more than any other system in the world.",
  ],
};

export function cityFunFacts(city: string | null): string[] {
  const base = city && CITY_FACTS[city]
    ? CITY_FACTS[city]
    : `${city || "Your city"} has its own story, and your order is making its way right through it.`;
  const extra = (city && CITY_FACTS_EXTRA[city]) || [];
  return [base, ...extra];
}

export function brandDidYouKnows(brandName: string): string[] {
  return [
    `${brandName} has grown into a brand trusted by customers around the world, with thoughtfully designed products, shipped with care straight to your door.`,
    `Every ${brandName} order is packed and dispatched with sustainable materials wherever possible.`,
    `${brandName} stands behind every purchase with a hassle-free return & exchange promise.`,
  ];
}
