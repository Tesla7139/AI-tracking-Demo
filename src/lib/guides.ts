import type { Brand } from "@/lib/site";
import type { ItemGuide, OrderItem } from "@/lib/tracking";
import * as priority from "@/lib/brands/prioritybicycles";

// Brands with hand-written setup & maintenance guides, matched on the store's hostname.
const BRAND_GUIDES: { match: RegExp; guides: { match: RegExp; guide: ItemGuide }[] }[] = [
  { match: /(^|\.)prioritybicycles\./i, guides: priority.ITEM_GUIDES },
];

/** Attach each item's setup & maintenance guide, for brands that have them. */
export function withItemGuides(brand: Brand, items: OrderItem[]): OrderItem[] {
  if (!brand.url) return items;
  let host: string;
  try {
    host = new URL(brand.url).hostname;
  } catch {
    return items;
  }
  const guides = BRAND_GUIDES.find((b) => b.match.test(host))?.guides;
  if (!guides) return items;
  return items.map((it) => ({ ...it, guide: guides.find((g) => g.match.test(it.name))?.guide }));
}
