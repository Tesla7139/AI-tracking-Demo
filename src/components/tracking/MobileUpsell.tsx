"use client";

import { ArrowRight, Package, Plus, Sparkles } from "lucide-react";
import type { OrderItem } from "@/lib/tracking";
import { ImageTile } from "./TrackingCard";

/**
 * Mobile-only "Perfect Pair" upsell shown at the very top of the tracking page.
 * The outer card takes the brand theme color; the ordered item + AI-recommended
 * pairing + Buy-now CTA sit in a smaller white box docked at its bottom.
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
    <section className="overflow-hidden rounded-2xl p-4 pt-4 shadow-soft-md" style={{ background: accent }}>
      {/* Header sits on the theme-colored top area */}
      <div className="flex items-center gap-2 px-1 pb-3.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-white">
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-white">Perfect Pair</p>
          <p className="text-[11px] leading-tight text-white/80">Complete your order</p>
        </div>
      </div>

      {/* Smaller white box docked at the bottom of the theme-colored card */}
      <div className="rounded-xl bg-white p-3.5 shadow-sm">
        <div className="flex items-stretch gap-3">
          <div className="flex-1">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ordered
            </span>
            <ImageTile
              accent={accent}
              src={item.image ?? undefined}
              alt={item.name}
              className="aspect-square w-full"
              label={<Package className="size-5 text-muted-foreground" />}
            />
          </div>
          <div className="flex items-center pt-5">
            <Plus className="size-5 shrink-0" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
              Pair with
            </span>
            <div className="rounded-lg p-[2px]" style={{ background: accent }}>
              <ImageTile
                accent={accent}
                src={item.rec.image ?? undefined}
                alt={item.rec.name}
                className="aspect-square w-full"
                label={<Package className="size-5 text-muted-foreground" />}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm font-bold text-foreground">{item.rec.name}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.rec.blurb}</p>

        <a
          href={href || "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.99]"
          style={{ background: accent }}
        >
          Buy now <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
