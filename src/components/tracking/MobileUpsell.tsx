"use client";

import { Package, Plus, Star } from "lucide-react";
import type { OrderItem } from "@/lib/tracking";
import { ImageTile } from "./TrackingCard";

/**
 * Mobile-only "Perfect Pair" upsell at the very top of the tracking page: the
 * ordered item + AI-recommended pairing + Buy-now CTA. The card takes the brand
 * theme color; the status card below slides up to overlap its lower area.
 */
export function MobileUpsell({
  item,
  accent,
  href,
}: {
  item: OrderItem;
  accent: string;
  href: string;
}) {
  return (
    <section
      className="-mx-4 -mt-5 overflow-hidden rounded-b-[2.75rem] px-5 pb-20 pt-5 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.3)]"
      style={{ background: accent }}
    >
      {/* Ordered + Pair with — two small white tiles on the theme-colored card */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 pt-1">
        <div className="flex flex-col items-center">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/85">
            Ordered
          </span>
          <div className="w-[74%] rounded-xl bg-white p-1 shadow-sm">
            <ImageTile
              accent={accent}
              src={item.image ?? undefined}
              alt={item.name}
              className="aspect-square w-full"
              label={<Package className="size-4 text-muted-foreground" />}
            />
          </div>
        </div>
        <div className="flex items-center self-center pt-6">
          <Plus className="size-5 shrink-0 text-white" />
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white">
            Pair with
          </span>
          <div className="w-[74%] rounded-xl bg-white p-1 shadow-sm">
            <ImageTile
              accent={accent}
              src={item.rec.image ?? undefined}
              alt={item.rec.name}
              className="aspect-square w-full"
              label={<Package className="size-4 text-muted-foreground" />}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-bold leading-snug text-white">{item.rec.name}</p>

      <div className="mt-2.5 rounded-xl bg-white/15 p-3">
        <p className="text-[13px] leading-relaxed text-white/90">
          <Star className="mr-1 inline size-3.5 -translate-y-px fill-white text-white" />
          <span className="font-bold">Perfect Pair:</span> {item.rec.blurb}
        </p>
      </div>

      <a
        href={href || "#"}
        target="_blank"
        rel="noreferrer"
        className="mx-auto mt-4 flex w-fit items-center justify-center rounded-full bg-white px-7 py-2.5 text-sm font-bold shadow-sm transition-transform active:scale-[0.98]"
        style={{ color: accent }}
      >
        Buy now
      </a>
    </section>
  );
}
