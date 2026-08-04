"use client";

import { useState } from "react";
import { Check, Package } from "lucide-react";
import { type ArrivalProduct } from "@/lib/tracking";
import { TrackingCard, ImageTile } from "./TrackingCard";
import { useDevice } from "./device";

// Deterministic per-card discount (no hydration mismatch) — the current price is
// treated as the sale price and a higher "MRP" is derived from it.
const DISCOUNTS = [40, 14, 25, 30, 20];

/** Mobile arrival card: image, name, sale price + struck MRP + % off, Add to Cart. */
function ArrivalCard({
  product,
  index,
  accent,
  sym,
}: {
  product: ArrivalProduct;
  index: number;
  accent: string;
  sym: string;
}) {
  const [added, setAdded] = useState(false);
  const pct = DISCOUNTS[index % DISCOUNTS.length];
  const mrp = Math.round(product.price / (1 - pct / 100));

  return (
    <div className="flex w-[170px] shrink-0 flex-col rounded-xl border border-border bg-card p-2.5 shadow-soft-sm">
      <ImageTile
        accent={accent}
        src={product.image || undefined}
        alt={product.name}
        className="aspect-square w-full"
        label={<Package className="size-6 text-muted-foreground" />}
      />
      <p className="mt-2 line-clamp-1 text-[13px] font-semibold text-foreground">{product.name}</p>

      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-sm font-bold text-foreground">{sym}{product.price}</span>
        <span className="text-[11px] text-muted-foreground line-through">{sym}{mrp}</span>
        <span className="text-[11px] font-semibold text-emerald-600">{pct}% OFF</span>
      </div>

      <button
        type="button"
        onClick={() => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold text-white transition-transform active:scale-[0.98]"
        style={{ background: accent }}
      >
        {added ? (
          <>
            <Check className="size-4" /> Added
          </>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}

export function NewArrivals({
  products,
  accent,
  sym,
}: {
  products: ArrivalProduct[];
  accent: string;
  sym: string;
}) {
  const mobile = useDevice() === "mobile";

  if (mobile) {
    return (
      <div>
        {/* Promo header — discount line + View All */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="flex-1 text-sm font-bold leading-snug text-foreground">
            Better Together — use{" "}
            <span style={{ color: accent }}>&lsquo;ADD25&rsquo;</span> for an Extra 25% Off
          </p>
          <button type="button" className="shrink-0 pt-0.5 text-xs font-semibold" style={{ color: accent }}>
            View All
          </button>
        </div>

        <div className="thin-scrollbar flex gap-3 overflow-x-auto pb-3">
          {products.map((p, i) => (
            <ArrivalCard key={`${p.name}-${i}`} product={p} index={i} accent={accent} sym={sym} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TrackingCard title="Explore Our New Arrivals">
      <div className="thin-scrollbar mt-4 flex gap-4 overflow-x-auto pb-3">
        {products.map((p, i) => (
          <div key={`${p.name}-${i}`} className="w-[180px] shrink-0">
            <ImageTile
              accent={accent}
              src={p.image || undefined}
              alt={p.name}
              className="aspect-square w-full"
              label={<Package className="size-6 text-muted-foreground" />}
            />
            {/* Fixed 2-line height so every price starts at the same level. */}
            <p className="mt-2 line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-foreground">
              {p.name}
            </p>
            <p className="mt-0.5 text-base font-bold" style={{ color: accent }}>
              {sym}
              {p.price}
            </p>
          </div>
        ))}
      </div>
    </TrackingCard>
  );
}
