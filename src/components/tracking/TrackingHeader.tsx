"use client";

import { useEffect, useState } from "react";
import { Timer, Gift, X } from "lucide-react";
import type { Brand } from "@/lib/site";
import { useDevice } from "./device";

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
  const name = brand.brandName;
  const mobile = useDevice() === "mobile";
  // Prefer the store's real logo (like newton's in the Figma) when it's a proper wide
  // wordmark; fall back to a compact Poppins name for missing / square-favicon logos.
  const [mode, setMode] = useState<"img" | "text">(brand.logo ? "img" : "text");
  // A predominantly white/light logo would vanish on the white banner → put it on a dark chip.
  const [lightLogo, setLightLogo] = useState(false);

  useEffect(() => {
    if (!brand.logo) return;
    setLightLogo(false);
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      try {
        const w = 32;
        const h = 32;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(probe, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let lum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 40) continue; // ignore transparent pixels
          lum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          count += 1;
        }
        if (count > 0 && lum / count > 205) setLightLogo(true);
      } catch {
        /* cross-origin canvas can't be read — leave as-is */
      }
    };
    probe.src = brand.logo;
  }, [brand.logo]);

  if (brand.logo && mode === "img") {
    return (
      <span className={lightLogo ? "inline-flex rounded-lg bg-neutral-900 px-3.5 py-2" : ""}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote brand logos from arbitrary hosts */}
        <img
          src={brand.logo}
          alt={name}
          className={`w-auto object-contain ${mobile ? "h-7 max-w-[150px]" : "h-11 max-w-[240px] md:h-12"}`}
          referrerPolicy="no-referrer"
          onError={() => setMode("text")}
          onLoad={(e) => {
            const img = e.currentTarget;
            const ratio = img.naturalWidth / img.naturalHeight;
            // Square / near-square (favicon) or tiny → not a real wordmark; use text.
            if (!ratio || ratio < 1.6 || img.naturalWidth < 64) setMode("text");
          }}
        />
      </span>
    );
  }

  const size = mobile
    ? name.length > 20
      ? "text-lg"
      : "text-xl"
    : name.length > 26
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
  const mobile = useDevice() === "mobile";

  return (
    <div className="w-full">
      {/* Sale ribbon — dark bar, white text, translucent pills (matches the Figma) */}
      {showSale && (
      <div
        className={`relative flex items-center justify-center text-white ${
          mobile ? "px-8 py-1.5 text-[11px]" : "px-6 py-3 text-sm"
        }`}
        style={{ background: brand.brandColor }}
      >
        {mobile ? (
          // Compact single line so the strip stays thin on a phone.
          <div className="flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden">
            <Gift className="size-3.5 shrink-0" />
            <span className="truncate font-medium">25% OFF + Free Shipping</span>
            <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
              <Seg value={h} />
              <span className="opacity-70">:</span>
              <Seg value={m} />
              <span className="opacity-70">:</span>
              <Seg value={s} />
            </span>
          </div>
        ) : (
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
        )}
        <button
          onClick={() => setShowSale(false)}
          aria-label="Dismiss announcement"
          className={`absolute rounded p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white ${
            mobile ? "right-2" : "right-4"
          }`}
        >
          <X className={mobile ? "size-3.5" : "size-4"} />
        </button>
      </div>
      )}

      {/* Logo banner */}
      <div className={`flex items-center justify-center border-b border-border/60 bg-white ${mobile ? "py-2.5" : "py-5"}`}>
        <BrandLogo brand={brand} />
      </div>
    </div>
  );
}
