"use client";

import { Package } from "lucide-react";
import { type ArrivalProduct } from "@/lib/tracking";
import { TrackingCard, ImageTile } from "./TrackingCard";

export function NewArrivals({
  products,
  accent,
  sym,
}: {
  products: ArrivalProduct[];
  accent: string;
  sym: string;
}) {
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
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">{p.name}</p>
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
