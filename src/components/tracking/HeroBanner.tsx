"use client";

import { useState } from "react";
import { UserRound, Leaf, ShieldCheck } from "lucide-react";
import type { Brand } from "@/lib/site";
import type { HeroCopy } from "@/lib/ai";
import { darken } from "@/lib/colors";
import { heroImage } from "@/lib/tracking";

const ICONS = [UserRound, Leaf, ShieldCheck];
const FALLBACK = {
  headline: "Made to move with you.",
  subtext:
    "Thoughtfully designed products that support every day, shipped with care and tracked with ease.",
  features: ["Designed for everyone", "Thoughtful materials", "Premium quality"],
};

/** Brand marketing banner over a lifestyle photo. Copy is AI-generated per brand when
 *  available (generated.heroCopy), else the static fallback above. */
export function HeroBanner({ brand, copy }: { brand: Brand; copy?: HeroCopy | null }) {
  const accent = brand.brandColor;
  const [imgErr, setImgErr] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  // Prefer a real lifestyle/banner image for advertising, then og:image, then a product photo.
  const img =
    brand.bannerImage || brand.ogImage || brand.products.find((p) => p.image)?.image || heroImage;
  const headline = copy?.headline || FALLBACK.headline;
  const subtext = copy?.subtext || FALLBACK.subtext;
  const features = copy?.features?.length ? copy.features.slice(0, 3) : FALLBACK.features;
  return (
    <div
      className="relative overflow-hidden rounded-xl text-white"
      style={{ background: `linear-gradient(120deg, ${darken(accent, 0.55)}, ${darken(accent, 0.2)})` }}
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
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div className="relative p-8 md:p-10">
      {brand.logo && !logoErr ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote brand logo
        <img
          src={brand.logo}
          alt={brand.brandName}
          onError={() => setLogoErr(true)}
          referrerPolicy="no-referrer"
          className="mb-3 h-9 w-auto max-w-[180px] rounded-md bg-white/95 object-contain p-1.5 shadow-sm"
        />
      ) : (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
          {brand.brandName}
        </p>
      )}
      <h3 className="mt-3 max-w-md text-3xl font-bold leading-tight md:text-4xl">
        {headline}
      </h3>
      <p className="mt-3 max-w-sm text-sm text-white/80">{subtext}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={brand.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold"
          style={{ color: darken(accent, 0.4) }}
        >
          Explore Collection
        </a>
        <a
          href={brand.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Shop Now
        </a>
      </div>

      <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5">
        {features.map((text, i) => {
          const Icon = ICONS[i] ?? UserRound;
          return (
            <span key={text} className="flex items-center gap-2 text-sm text-white/85">
              <Icon className="size-4" /> {text}
            </span>
          );
        })}
      </div>
      </div>
    </div>
  );
}
