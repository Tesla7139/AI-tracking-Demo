"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gem, HeartHandshake, Package, ShieldCheck, SlidersHorizontal, Star, Wrench, X } from "lucide-react";
import { type ItemGuide, type OrderItem } from "@/lib/tracking";
import { formatPrice } from "@/lib/site";
import { TrackingCard, ImageTile } from "./TrackingCard";
import { useDevice } from "./device";
import { BottomSheet } from "./sheet";

const TIPS = [
  { key: "styleTip", label: "Pro Tip", icon: Gem, bg: "#e8f8ef", color: "#00a862" },
  { key: "careTip", label: "Care Tip", icon: HeartHandshake, bg: "#eff6fe", color: "#3b82f6" },
] as const;

/** Optional brand colours for the Pro Tip box (background + icon). */
export type TipColors = { bg: string; color: string };

function Tip({
  item,
  tip,
  accent,
  proColors,
}: {
  item: OrderItem;
  tip: (typeof TIPS)[number];
  accent: string;
  proColors?: TipColors;
}) {
  const Icon = tip.icon;
  const isPro = tip.key === "styleTip";
  const colors = (isPro && proColors) || tip;
  return (
    <div className="rounded-lg p-3" style={{ background: colors.bg }}>
      <div className="flex gap-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white"
          style={{ color: colors.color }}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">{tip.label}:</span> {item[tip.key]}
        </p>
      </div>

      {/* AI upsell recommendation nested inside the Pro Tip */}
      {isPro && item.rec && (
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

const GUIDE_SECTIONS = [
  { key: "setup", label: "How to setup", icon: Wrench, bg: "#fff6e5", color: "#d97706" },
  { key: "maintain", label: "How to maintain", icon: ShieldCheck, bg: "#f1f1f1", color: "#1c1c1c" },
] as const;

/** "How to setup" + "How to maintain" bullet lists; shared by the modal and the sheet. */
function GuideBody({ guide }: { guide: ItemGuide }) {
  return (
    <div className="flex flex-col gap-3">
      {GUIDE_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        return (
          <div key={sec.key} className="flex gap-3 rounded-xl p-4" style={{ background: sec.bg }}>
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white"
              style={{ color: sec.color }}
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-foreground">{sec.label}:</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground">
                {guide[sec.key].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Desktop: centred modal over the whole page (portalled out of the zoomed page). */
function GuideModal({ open, onClose, guide }: { open: boolean; onClose: () => void; guide: ItemGuide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Setup and Maintenance Guide"
            className="relative w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-foreground">Setup and Maintenance Guide</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-background-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <GuideBody guide={guide} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Brand-coloured "Setup and Maintenance Guide" button; opens a modal (desktop) or sheet (mobile). */
function GuideButton({ guide, accent, mobile }: { guide: ItemGuide; accent: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98] ${
          mobile ? "mt-2 w-full" : "w-fit"
        }`}
        style={{ background: accent }}
      >
        <Wrench className="size-4" /> Setup and Maintenance Guide
      </button>
      {mobile ? (
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Setup and Maintenance Guide">
          <GuideBody guide={guide} />
        </BottomSheet>
      ) : (
        <GuideModal open={open} onClose={() => setOpen(false)} guide={guide} />
      )}
    </>
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
          <p className="mt-1 text-base font-semibold text-foreground">{sym}{formatPrice(item.price)}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Qty: {item.qty} · {item.variant}
          </p>
        </div>
      </div>

      {item.guide && <GuideButton guide={item.guide} accent={accent} />}

      <div className="flex flex-col gap-2">
        {TIPS.map((tip) => (
          <Tip key={tip.key} item={item} tip={tip} accent={accent} />
        ))}
      </div>
    </div>
  );
}

/** Mobile order item: a card with a big product image on top, name + qty + price,
 *  and a light "Pro & Care Tips" button that opens the tips in a bottom sheet. */
function MobileItemCard({
  item,
  accent,
  sym,
  proColors,
}: {
  item: OrderItem;
  accent: string;
  sym: string;
  proColors?: TipColors;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft-md">
      {/* Big product image */}
      <ImageTile
        accent={accent}
        src={item.image}
        alt={item.name}
        className="aspect-[4/3] w-full"
        label={<Package className="size-6 text-muted-foreground" />}
      />

      <div className="mt-3 flex flex-1 flex-col border-t border-border/60 pt-3">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 flex-1 text-sm font-bold text-foreground">{item.name}</p>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: `${accent}14`, color: accent }}
          >
            Qty: {item.qty}
          </span>
        </div>
        <p className="mt-1.5 mb-3 text-lg font-bold text-foreground">{sym}{formatPrice(item.price)}</p>

        {/* mt-auto pins the button to the bottom so cards in the swipe row line up */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/10 bg-primary/[0.05] px-3 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
        >
          <Star className="size-4" /> Pro &amp; Care Tips
        </button>
        {item.guide && <GuideButton guide={item.guide} accent={accent} mobile />}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={item.name}>
        <div className="flex flex-col gap-2">
          {TIPS.map((tip) => (
            <Tip key={tip.key} item={item} tip={tip} accent={accent} proColors={proColors} />
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
  showAll = false,
  proTipColors,
}: {
  items: OrderItem[];
  accent: string;
  sym: string;
  /** Mobile: swipe through every item instead of showing only the first. */
  showAll?: boolean;
  /** Mobile: brand colours for the Pro Tip box instead of the default green. */
  proTipColors?: TipColors;
}) {
  const mobile = useDevice() === "mobile";

  if (mobile) {
    // Mobile shows a single, compact ordered item as one clean card (no outer box),
    // or with `showAll`, a swipeable row of every item.
    const item = items[0];
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="size-5" style={{ color: accent }} />
          <h2 className="text-lg font-bold text-foreground">
            My Order Items <span className="text-muted-foreground">({items.length})</span>
          </h2>
        </div>
        {showAll && items.length > 1 ? (
          <div className="thin-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3">
            {items.map((it, i) => (
              <div key={it.name} className="flex w-[82%] shrink-0 snap-center flex-col">
                <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                  Item {i + 1} of {items.length} · {it.variant}
                </p>
                <MobileItemCard item={it} accent={accent} sym={sym} proColors={proTipColors} />
              </div>
            ))}
          </div>
        ) : (
          item && <MobileItemCard item={item} accent={accent} sym={sym} proColors={proTipColors} />
        )}
      </div>
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
