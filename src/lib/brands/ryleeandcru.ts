// Rylee + Cru content for the mobile tracking page, ported from the hand-built
// desktop page in public/brands/ryleeandcru/index.html (keep the two in sync).
import type { OrderItem } from "@/lib/tracking";

const IMG = "/brands/ryleeandcru/assets/products/";
const BANNERS = "/brands/ryleeandcru/assets/banners/";

export type KidProduct = {
  id: string;
  name: string;
  colour: string;
  price: number;
  img: string;
  stock: string;
  low?: boolean;
};

export type Kid = {
  key: string;
  name: string;
  pronoun: "his" | "her";
  birthDate: string; // YYYY-MM-DD
  size: string;
  accent: string;
  accentSoft: string;
  accentMid: string;
  look: { title: string; ids: string[]; bundle: number };
  birthdayLook: { title: string; ids: string[]; bundle: number };
  picks: string[];
  products: KidProduct[];
};

const p = (id: string, name: string, colour: string, price: number, file: string, stock: string, low?: boolean): KidProduct => ({
  id, name, colour, price, img: IMG + file, stock, low,
});

export const KIDS: Kid[] = [
  {
    key: "brooks",
    name: "Brooks",
    pronoun: "his",
    birthDate: "2023-03-14",
    size: "2-3Y",
    accent: "#6f7f6a",
    accentSoft: "#eef1ea",
    accentMid: "#d9e0d3",
    look: { title: "His cosy weekend look", ids: ["b1", "b4", "b7"], bundle: 99.95 },
    birthdayLook: { title: "His birthday party look", ids: ["b6", "b4", "b7"], bundle: 89.95 },
    picks: ["b3", "b2", "b6"],
    products: [
      p("b1", "Rex Sweater", "Tree Fair Isle", 54.6, "rex-sweater-tree-fair-isle.jpg", "Best seller"),
      p("b2", "Relaxed Fleece Sweatshirt", "Holiday Drive", 34.65, "relaxed-fleece-sweatshirt-holiday-drive.jpg", "In stock"),
      p("b3", "Ezrah Jacket", "Latte", 67.2, "ezrah-jacket-latte.jpg", "Only 2 left", true),
      p("b4", "Luca Pant", "Latte", 44.1, "luca-pant-latte.jpg", "In stock"),
      p("b6", "Milo Shirt", "Christmas Plaid", 44.1, "milo-shirt-christmas-plaid.jpg", "New this week"),
      p("b7", "Beanie", "Spruce", 18.9, "beanie-spruce.jpg", "In stock"),
    ],
  },
  {
    key: "noa",
    name: "Noa",
    pronoun: "her",
    birthDate: "2024-11-09",
    size: "18-24M",
    accent: "#b97a72",
    accentSoft: "#f8eeec",
    accentMid: "#efd8d4",
    look: { title: "Her holiday floral look", ids: ["n1", "n3", "n6"], bundle: 110.9 },
    birthdayLook: { title: "Her birthday party look", ids: ["n1", "n3", "n6"], bundle: 110.9 },
    picks: ["n4", "n7", "n5"],
    products: [
      p("n1", "Carina Dress", "Holiday Floral", 56.7, "carina-dress-holiday-floral.jpg", "In stock"),
      p("n3", "Holly Cardigan", "Natural", 54.6, "holly-cardigan-natural.jpg", "In stock"),
      p("n4", "V Smocked Dress", "Winter Rose", 54.6, "v-smocked-dress-winter-rose.jpg", "New this week"),
      p("n5", "Relaxed Fleece Sweatshirt", "Mittens", 34.65, "relaxed-fleece-sweatshirt-mittens.jpg", "Best seller"),
      p("n6", "Bow", "Winter Rose", 14.7, "bow-winter-rose.jpg", "In stock"),
      p("n7", "Shearling Zip Jacket", "Rose Water", 65.1, "shearling-zip-jacket-rose-water.jpg", "Only 2 left", true),
    ],
  },
];

export const kidByKey = (key: string) => KIDS.find((k) => k.key === key)!;

/** A birthday within 30 days gets the birthday edit and a countdown; order 5 days ahead. */
export function upcomingBirthday(kid: Kid, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const born = new Date(kid.birthDate + "T00:00:00");
  const next = new Date(t.getFullYear(), born.getMonth(), born.getDate());
  if (next < t) next.setFullYear(next.getFullYear() + 1);
  const days = Math.round((next.getTime() - t.getTime()) / 86400000);
  if (days > 30) return null;
  const orderBy = new Date(next);
  orderBy.setDate(orderBy.getDate() - 5);
  return { days, date: next, orderBy, tooLate: orderBy < t };
}

export const KID_PROMO = {
  kid: "noa",
  img: BANNERS + "noa-cardigan.webp",
  title: "Cosy knits Noa will live in",
  sub: "Holiday cardigans and florals, handpicked in her size.",
  cta: "Explore collection",
};

export const SIBLING_SET = {
  print: "Winter Plaid",
  banner: BANNERS + "holiday-01.jpg",
  bundleSave: 0.1,
  items: [
    { kid: "brooks", name: "Pocketed Flannel Shirt", price: 60.9, img: IMG + "pocketed-flannel-shirt-winter-plaid.jpg" },
    { kid: "noa", name: "Jolene Dress", price: 69.3, img: IMG + "jolene-dress-winter-plaid.jpg" },
  ],
};

export const FESTIVE = {
  name: "Halloween",
  month: 10,
  day: 31,
  sub: "Little pumpkins, dancing ghosts and cosy PJs, ready for a chilly night of trick-or-treating.",
  items: [
    { for: ["brooks", "noa"], name: "Bamboo Pajama Set – Dancing Ghosts", price: 30.71, img: IMG + "bamboo-pajama-set-dancing-ghosts.jpg" },
    { for: ["brooks"], name: "Relaxed Fleece Sweatshirt – Lil Pumpkin", price: 24.26, img: IMG + "relaxed-fleece-sweatshirt-lil-pumpkin.jpg" },
    { for: ["noa"], name: "Darla Dress – Pumpkins", price: 46.2, img: IMG + "darla-dress-pumpkins.jpg" },
    { for: ["noa"], name: "Darla Dress – Sweet Ghost", price: 46.2, img: IMG + "darla-dress-sweet-ghost.jpg" },
  ],
};

export const EVERYDAY = {
  title: "Made for Everyday Adventures",
  body: "Rylee + Cru brings a modern, nostalgic feel to everyday dressing with artful prints, relaxed silhouettes, and thoughtfully designed pieces made for every adventure, big or small.",
  ctas: ["Explore Collection"],
  img: BANNERS + "everyday-adventures.webp",
};

/** Pro Tip colours on mobile, matching .oi-tip--pro on the desktop page. */
export const PRO_TIP_COLORS = { bg: "#f6f1ec", color: "#8f7a69" };

export const FUN_FACTS = [
  "New York City is home to over 800 languages spoken by its residents, making it one of the most linguistically diverse cities in the world",
];

export const DID_YOU_KNOW = [
  "Rylee + Cru began as a mother's dream of heirloom-worthy childhood style, a legacy we hope Brooks and Noa wear with the same joy you feel dressing them.",
];

// Each ordered item: one Pro Tip with a matched add-on, and one Care Tip.
const item = (
  name: string, colour: string, price: number, kid: string, file: string,
  tip: string, rec: [string, string, number, string], care: string
): OrderItem => ({
  name: `${name} – ${colour}`,
  variant: `Size ${kidByKey(kid).size} · For ${kidByKey(kid).name}`,
  qty: 1,
  price,
  image: IMG + file,
  styleTip: tip,
  careTip: care,
  usageTip: "",
  rec: { name: `${rec[0]} – ${rec[1]}`, blurb: tip, image: IMG + rec[3] },
});

export const ORDER_ITEMS: OrderItem[] = [
  item("Chunky Knit Sweater", "Heathered Latte", 54.6, "brooks", "chunky-knit-sweater-heathered-latte.jpg",
    "Make it a matching knit set with the pant in the same yarn.",
    ["Chunky Knit Pant", "Heathered Latte", 36.75, "chunky-knit-pant-heathered-latte.jpg"],
    "Hand wash cold and dry flat so the chunky knit keeps its shape."),
  item("Luca Pant", "Spruce", 44.1, "brooks", "luca-pant-spruce.jpg",
    "Tone-on-tone with the pant, a spruce beanie finishes the look on chilly days.",
    ["Beanie", "Spruce", 18.9, "beanie-spruce.jpg"],
    "Wash cold with like colours and tumble dry low to keep the gauze soft."),
  item("Bear Jumpsuit", "Latte", 65.1, "noa", "bear-jumpsuit-latte.jpg",
    "Warm socks under the bear suit keep little toes cosy on outings.",
    ["Socks Set", "Natural / Redwood", 14.7, "socks-set-natural-redwood.jpg"],
    "Zip up before washing. Wash cold, tumble dry low, then brush the pile gently."),
  item("Hooded Jumpsuit", "Gingerbread", 57.75, "noa", "hooded-jumpsuit-gingerbread.jpg",
    "The same gingerbread print in a sweatpant mixes easily with tops she already has.",
    ["Relaxed Fleece Sweatpant", "Gingerbread", 29.4, "relaxed-fleece-sweatpant-gingerbread.jpg"],
    "Wash inside out in cold water to keep the fleece print bright."),
  item("Bamboo Pajama Set", "Forest Friends", 40.95, "brooks", "bamboo-pajama-set-forest-friends.jpg",
    "Add the matching footie for Noa, sibling PJs for holiday mornings.",
    ["Bamboo Zip Footie", "Forest Friends", 40.95, "bamboo-zip-footie-forest-friends.jpg"],
    "Bamboo is delicate: wash cold, skip fabric softener and line dry."),
  item("Velour Baby Dress", "Redwood", 46.2, "noa", "velour-baby-dress-redwood.jpg",
    "The matching velour bow completes the holiday-card look.",
    ["Velour Bow Headband", "Redwood", 12.6, "velour-bow-headband-redwood.jpg"],
    "Wash cold inside out. Don't iron velour; steam lightly to lift the pile."),
  item("Alda Dress", "Red Bows", 46.2, "noa", "alda-dress-red-bows.jpg",
    "Ribbed redwood tights pick up the bow print and keep legs warm.",
    ["Tights", "Redwood", 16.8, "tights-redwood.jpg"],
    "Wash cold with darks and lay flat to dry."),
  item("Holly Cardigan", "Redwood", 54.6, "noa", "holly-cardigan-redwood.jpg",
    "A crochet bow in the same redwood ties the cardigan into an outfit.",
    ["Crochet Bow", "Redwood", 14.7, "crochet-bow-redwood.jpg"],
    "Hand wash cold and dry flat. Fold, don't hang, to avoid shoulder bumps."),
  item("Darla Dress", "Gingerbread", 57.75, "noa", "darla-dress-gingerbread.jpg",
    "A soft latte beanie suits the gingerbread print for outdoor days.",
    ["Beanie", "Heathered Latte", 18.9, "beanie-heathered-latte.jpg"],
    "Wash cold and tumble dry low; high heat makes fleece pill."),
  item("Callie Romper", "Holiday Floral", 48.3, "noa", "callie-romper-holiday-floral.jpg",
    "The matching floral bonnet is cut from the same cotton gauze.",
    ["Woven Baby Bonnet", "Holiday Floral", 14.7, "woven-baby-bonnet-holiday-floral.jpg"],
    "Wash cold and tumble dry low. Soft wrinkles are part of gauze's charm."),
  item("Rex Sweater", "Mushroom", 54.6, "brooks", "rex-sweater-mushroom.jpg",
    "Mushroom and latte go together. Pair it with the corduroy Luca Pant.",
    ["Luca Pant", "Latte", 44.1, "luca-pant-latte.jpg"],
    "Hand wash cold, dry flat, and de-pill gently with a sweater comb."),
  item("Shearling Zip Jacket", "Fog", 65.1, "brooks", "shearling-zip-jacket-fog.jpg",
    "The fog beanie matches the jacket for a head-to-toe winter look.",
    ["Beanie", "Fog", 18.9, "beanie-fog.jpg"],
    "Spot clean where you can; otherwise wash cold on gentle and air dry."),
];
