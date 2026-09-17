"use client";

import { useEffect, useState } from "react";
import type { Brand } from "@/lib/site";
import { getPaidProducts } from "@/lib/tracking";
import type { UpsellRec, HeroCopy } from "@/lib/ai";

export type Generated = {
  enabled: boolean;
  cityFacts: string[] | null;
  brandFacts: string[] | null;
  upsells: UpsellRec[] | null;
  heroCopy: HeroCopy | null;
};

/**
 * Fetches AI-generated content (city facts, brand facts, upsell picks) for the brand.
 * No-ops to nulls until OPENAI_API_KEY is set, so the UI falls back to static content.
 */
export function useGenerated(brand: Brand | null): Generated | null {
  const [gen, setGen] = useState<Generated | null>(null);

  useEffect(() => {
    if (!brand) return;
    let cancelled = false;
    const products = getPaidProducts(brand.products);
    (async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName: brand.brandName,
            city: brand.city,
            country: brand.country,
            orderedTitles: products.slice(0, 2).map((p) => p.title),
            catalogTitles: products.map((p) => p.title),
          }),
        });
        if (!cancelled && res.ok) setGen((await res.json()) as Generated);
      } catch {
        /* keep static fallbacks */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand?.brandName]);

  return gen;
}
