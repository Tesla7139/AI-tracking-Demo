"use client";

import { useState } from "react";
import { Gem, HeartHandshake, Package, Sparkles } from "lucide-react";
import { type OrderItem } from "@/lib/tracking";
import { TrackingCard, ImageTile } from "./TrackingCard";
import { useDevice } from "./device";
import { BottomSheet } from "./sheet";

const TIPS = [
  { key: "styleTip", label: "Pro Tip", icon: Gem, bg: "#e8f8ef", color: "#00a862" },
  { key: "careTip", label: "Care Tip", icon: HeartHandshake, bg: "#eff6fe", color: "#3b82f6" },
] as const;

function Tip({
  item,
  tip,
  accent,
}: {
  item: OrderItem;
  tip: (typeof TIPS)[number];
  accent: string;
}) {
  const Icon = tip.icon;
  const isPro = tip.key === "styleTip";
  return (
    <div className="rounded-lg p-3" style={{ background: tip.bg }}>
      <div className="flex gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white"
          style={{ color: tip.color }}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">{tip.label}:</span> {item[tip.key]}
        </p>
      </div>

      {/* AI upsell recommendation nested inside the Pro Tip */}
      {isPro && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-3 shadow-soft-sm">
          <ImageTile accent={accent} src={item.rec.image} alt={item.rec.name} className="size-14 shrink-0" label={<Package className="size-4 text-muted-foreground" />} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{item.rec.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.rec.blurb}</p>
          </div>
          <button className="shrink-0 text-sm font-semibold text-[#2563eb]">
            Buy now
          </button>
        </div>
      )}
    </div>
  );
}

/** Desktop order item: image left, tips shown inline below (unchanged). */
function OrderItemCard({
  item,
  index,
  total,
  accent,
  sym,
}: {
  item: OrderItem;
  index: number;
  total: number;
  accent: string;
  sym: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="inline-flex w-fit items-center rounded-full bg-background-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
        Item {index + 1}/{total}
      </span>

      {/* product row — image left; name, price, meta stacked (matches the Figma) */}
      <div className="flex items-start gap-4 rounded-lg border border-border/60 bg-card p-3">
        <ImageTile
          accent={accent}
          src={item.image}
          alt={item.name}
          className="size-20 shrink-0"
          label={<Package className="size-5 text-muted-foreground" />}
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground">{item.name}</p>
          <p className="mt-1 text-base font-semibold text-foreground">{sym}{item.price}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Qty: {item.qty} · {item.variant}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {TIPS.map((tip) => (
          <Tip key={tip.key} item={item} tip={tip} accent={accent} />
        ))}
      </div>
    </div>
  );
}

/** Mobile order item: a compact horizontal row (image left, details right) with a
 *  "Tips" button that opens the Pro/Care tips + upsell in a bottom sheet. */
function MobileItemRow({ item, accent, sym }: { item: OrderItem; accent: string; sym: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-3">
        <ImageTile
          accent={accent}
          src={item.image}
          alt={item.name}
          className="size-16 shrink-0"
          label={<Package className="size-5 text-muted-foreground" />}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-bold text-foreground">{item.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{sym}{item.price}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Qty: {item.qty} · {item.variant}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
      >
        <Sparkles className="size-3.5" /> Pro &amp; Care Tips
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={item.name}>
        <div className="flex flex-col gap-2">
          {TIPS.map((tip) => (
            <Tip key={tip.key} item={item} tip={tip} accent={accent} />
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

export function OrderItems({
  items,
  accent,
  sym,
}: {
  items: OrderItem[];
  accent: string;
  sym: string;
}) {
  const mobile = useDevice() === "mobile";

  if (mobile) {
    // Mobile shows a single, compact ordered item.
    const item = items[0];
    return (
      <TrackingCard title="Order Item(s)">
        <div className="mt-4">
          {item && <MobileItemRow item={item} accent={accent} sym={sym} />}
        </div>
      </TrackingCard>
    );
  }

  return (
    <TrackingCard title="Order Item(s)" className="flex h-full flex-col">
      {/* Desktop: absolute list scrolls within the row. */}
      <div className="relative mt-4 min-h-0 flex-1">
        <div className="thin-scrollbar absolute inset-0 flex flex-col gap-6 overflow-y-auto pr-2">
          {items.map((item, i) => (
            <OrderItemCard key={item.name} item={item} index={i} total={items.length} accent={accent} sym={sym} />
          ))}
        </div>
      </div>
    </TrackingCard>
  );
}
