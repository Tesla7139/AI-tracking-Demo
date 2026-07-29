"use client";

import { useEffect, useState } from "react";
import { Timer, Gift, X } from "lucide-react";
import type { Brand } from "@/lib/site";

/** Two-digit countdown segment in a translucent box (matches the Figma). */
function Seg({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-[30px] items-center justify-center rounded bg-white/15 px-1.5 py-1 font-semibold tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
  );
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    h: Math.floor(left / 3600),
    m: Math.floor((left % 3600) / 60),
    s: left % 60,
  };
}

function BrandLogo({ brand }: { brand: Brand }) {
  // Brand name as a compact, rounded geometric wordmark (Poppins), sized to match
  // the Figma's logo-to-content ratio (much smaller than a hero headline).
  const name = brand.brandName;
  const size =
    name.length > 26
      ? "text-xl md:text-2xl"
      : name.length > 16
      ? "text-2xl md:text-3xl"
      : "text-3xl md:text-4xl";
  return (
    <span
      className={`max-w-[92%] break-words text-center font-semibold leading-tight tracking-tight ${size}`}
      style={{
        color: brand.brandColor,
        fontFamily: "var(--font-logo), var(--font-inter), system-ui, sans-serif",
      }}
    >
      {name}
    </span>
  );
}

export function TrackingHeader({ brand }: { brand: Brand }) {
  const { h, m, s } = useCountdown(5 * 3600 + 42 * 60);
  const [showSale, setShowSale] = useState(true);

  return (
    <div className="w-full">
      {/* Sale ribbon — dark bar, white text, translucent pills (matches the Figma) */}
      {showSale && (
      <div className="relative flex items-center justify-center px-6 py-3 text-sm text-white" style={{ background: brand.brandColor }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-2">
            <Gift className="size-4 shrink-0" />
            <span className="hidden sm:inline">
              Summer Slumber Party Sale: 25% OFF 1000&apos;s of finds + FREE Shipping Sitewide Use code:
            </span>
            <span className="sm:hidden">Summer Sale: 25% OFF + FREE Shipping</span>
            <span className="rounded bg-white/15 px-2 py-1 font-bold tracking-wide">FLASH</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="size-4" />
            <Seg value={h} />
            <span className="opacity-70">:</span>
            <Seg value={m} />
            <span className="opacity-70">:</span>
            <Seg value={s} />
          </span>
          <button className="rounded bg-white/15 px-3 py-1 font-semibold transition-colors hover:bg-white/25">
            Shop Now
          </button>
        </div>
        <button
          onClick={() => setShowSale(false)}
          aria-label="Dismiss announcement"
          className="absolute right-4 rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
      )}

      {/* Logo banner */}
      <div className="flex items-center justify-center border-b border-border/60 bg-white py-5">
        <BrandLogo brand={brand} />
      </div>
    </div>
  );
}
