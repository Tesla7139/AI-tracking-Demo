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
  // "img" while we have a usable wide logo; "text" for a clean Helvetica wordmark
  // (used when the logo fails, or when the fetched logo is a square favicon rather
  // than a real wordmark — a square icon reads as broken in a logo banner).
  const [mode, setMode] = useState<"img" | "text">(brand.logo ? "img" : "text");

  if (brand.logo && mode === "img") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote brand logos from arbitrary hosts
      <img
        src={brand.logo}
        alt={brand.brandName}
        className="h-14 w-auto max-w-[300px] object-contain"
        onError={() => setMode("text")}
        onLoad={(e) => {
          const img = e.currentTarget;
          const ratio = img.naturalWidth / img.naturalHeight;
          // Square / near-square (favicon) or tiny → not a wordmark; use text instead.
          if (!ratio || ratio < 1.6 || img.naturalWidth < 64) setMode("text");
        }}
      />
    );
  }
  // No usable logo image → a branded monogram lockup (accent badge + wordmark),
  // so a store whose logo we couldn't find still reads as intentional, not bare.
  const initials =
    brand.brandName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  return (
    <span
      className="flex items-center gap-3"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
        style={{ background: brand.brandColor }}
      >
        {initials}
      </span>
      <span className="text-4xl font-bold tracking-tight text-foreground">{brand.brandName}</span>
    </span>
  );
}

export function TrackingHeader({ brand, onReset }: { brand: Brand; onReset: () => void }) {
  const { h, m, s } = useCountdown(5 * 3600 + 42 * 60);

  return (
    <div className="w-full">
      {/* Sale ribbon — dark bar, white text, translucent pills (matches the Figma) */}
      <div className="relative flex items-center justify-center px-6 py-3 text-sm text-white" style={{ background: "#26242a" }}>
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
          onClick={onReset}
          aria-label="Try another store"
          className="absolute right-4 rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Logo banner */}
      <div className="flex items-center justify-center border-b border-border/60 bg-white py-5">
        <BrandLogo brand={brand} />
      </div>
    </div>
  );
}
