"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Brand } from "@/lib/site";
import { darken } from "@/lib/colors";
import { promoImage } from "@/lib/tracking";
import { cn } from "@/lib/utils";

/** Promotional brand image at the bottom of the right rail. Grows to fill leftover
 *  rail height (via `className="flex-1"`) so the column reaches the bottom cleanly. */
export function PromoCard({ brand, className }: { brand: Brand; className?: string }) {
  const accent = brand.brandColor;
  const [imgErr, setImgErr] = useState(false);
  // Use a product photo DIFFERENT from the hero's image (hero: banner/og, else 1st product).
  const heroImg =
    brand.bannerImage || brand.ogImage || brand.products.find((p) => p.image)?.image || null;
  const productImgs = brand.products.map((p) => p.image).filter(Boolean) as string[];
  const img = productImgs.find((i) => i !== heroImg) || productImgs[0] || promoImage;
  return (
    <div
      className={cn(
        "relative min-h-[220px] w-full overflow-hidden rounded-xl text-white shadow-soft-md",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${darken(accent, 0.5)}, ${darken(accent, 0.15)})` }}
    >
      {!imgErr && (
        // eslint-disable-next-line @next/next/no-img-element -- remote stock/generated imagery
        <img
          src={img}
          alt=""
          onError={() => setImgErr(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%)" }}
      />
      <div className="relative flex h-full max-w-[65%] flex-col justify-center p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
          {brand.brandName}
        </p>
        <p className="mt-1 text-lg font-bold leading-tight">Bundle &amp; save</p>
        <p className="mt-1 text-xs text-white/80">Buy 2, get 20% off, this week only.</p>
        <a
          href={brand.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
        >
          View Deals <ArrowRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
