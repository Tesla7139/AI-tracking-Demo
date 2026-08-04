"use client";

import { ArrowRight, Package, Plus, Sparkles } from "lucide-react";
import type { OrderItem } from "@/lib/tracking";
import { ImageTile } from "./TrackingCard";

/**
 * Mobile-only "Perfect Pair" upsell at the very top of the tracking page: the
 * ordered item + AI-recommended pairing + Buy-now CTA. Clean white card; the
 * accent is used only for the small accents (chip, labels, CTA).
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
    <section className="overflow-hidden rounded-2xl border border-border bg-white p-4 pb-14 shadow-soft-md">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3.5">
        <span className="flex size-6 items-center justify-center rounded-full text-white" style={{ background: accent }}>
          <Sparkles className="size-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-foreground">Perfect Pair</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Complete your order</p>
        </div>
      </div>

      {/* Ordered + Pair with — two equal, consistently-framed tiles */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div className="flex flex-col items-center">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ordered
          </span>
          <div className="w-[74%] rounded-xl border border-border p-1">
            <ImageTile
              accent={accent}
              src={item.image ?? undefined}
              alt={item.name}
              className="aspect-square w-full"
              label={<Package className="size-4 text-muted-foreground" />}
            />
          </div>
        </div>
        <div className="flex items-center self-center pt-5">
          <Plus className="size-5 shrink-0" style={{ color: accent }} />
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
            Pair with
          </span>
          <div className="w-[74%] rounded-xl border p-1" style={{ borderColor: accent }}>
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
    </section>
  );
}
