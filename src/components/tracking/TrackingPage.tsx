"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPinned, Lightbulb } from "lucide-react";
import { currencySymbol, type Brand, type GeoLocation, type Weather } from "@/lib/site";
import { cityFunFacts, brandDidYouKnows, buildOrderItems, buildNewArrivals } from "@/lib/tracking";
import { useDevice } from "./device";
import type { Generated } from "@/hooks/useGenerated";
import { TrackingHeader } from "./TrackingHeader";
import { StatusCards } from "./StatusCards";
import { WeatherWidget } from "./WeatherWidget";
import { ShipmentJourney } from "./ShipmentJourney";
import { OrderItems } from "./OrderItems";
import { NewArrivals } from "./NewArrivals";
import { InfoCard } from "./InfoCard";
import { OrderDetails } from "./OrderDetails";
import { TrackingFooter } from "./TrackingFooter";
import { HeroBanner } from "./HeroBanner";
import { PromoCard } from "./PromoCard";
import { MobileUpsell } from "./MobileUpsell";
import { MobileStatus } from "./MobileStatus";

// Persists across remounts within a session so the entrance reveal plays only ONCE
// (not every time the desktop/mobile toggle remounts the page — that looked glitchy).
let hasRevealed = false;

export function TrackingPage({
  brand,
  location,
  weather,
  generated,
}: {
  brand: Brand;
  location: GeoLocation | null;
  weather: Weather | null;
  generated: Generated | null;
}) {
  const mobile = useDevice() === "mobile";
  const accent = brand.brandColor;
  const city = location?.city ?? null;
  const sym = currencySymbol(brand.currency);
  // When we couldn't scrape a real catalog (samples), still show ONE real brand photo
  // (the store's banner/og image) on the first item + first arrival, rest stay mockups.
  const sampled = brand.products.length === 0;
  const brandPhoto = sampled ? brand.bannerImage || brand.ogImage : null;

  const arrivals = buildNewArrivals(brand.products);
  if (brandPhoto && arrivals.length) arrivals[0] = { ...arrivals[0], image: brandPhoto };

  // AI-generated content when available, else the static/curated fallbacks.
  const funFacts = generated?.cityFacts?.length ? generated.cityFacts : cityFunFacts(city);
  const brandFacts = generated?.brandFacts?.length
    ? generated.brandFacts
    : brandDidYouKnows(brand.brandName);

  // Order items from the catalog; override the upsell with the AI pick when present.
  const items = buildOrderItems(brand.products).map((it) => {
    const rec = generated?.upsells?.find((u) => u.forItem === it.name);
    return rec ? { ...it, rec: { ...it.rec, name: rec.name, blurb: rec.blurb } } : it;
  });
  if (brandPhoto && items.length) items[0] = { ...items[0], image: brandPhoto };
  const orderValue =
    sym + items.reduce((s, it) => s + it.price * (it.qty || 1), 0).toLocaleString();

  // Play the staggered entrance only on the first mount of the session.
  const [animateReveal] = useState(() => !hasRevealed);
  useEffect(() => {
    hasRevealed = true;
  }, []);

  // Staggered "typewriter"-style reveal: each box opens after the previous one.
  // On remounts (e.g. toggling desktop/mobile) it renders instantly, no re-animation.
  const reveal = (delay: number) =>
    animateReveal
      ? {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as const },
        }
      : { initial: false as const, animate: { opacity: 1, y: 0 } };

  // ---- Mobile: a clean, section-by-section single column (native app feel) ----
  if (mobile) {
    return (
      <motion.div
        initial={animateReveal ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full overflow-x-clip bg-[#f7f8fa]"
        style={{ zoom: 0.86, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        <TrackingHeader brand={brand} />

        <div className="flex flex-col gap-4 px-4 py-4">
          {/* Perfect-pair upsell — front and centre at the top */}
          {items[0] && <MobileUpsell item={items[0]} accent={accent} href={brand.url || "#"} />}

          {/* Tracking status — slides up to overlap the upsell above it (layered look) */}
          <div id="tour-status" className="relative z-[1] -mt-16 scroll-mt-24">
            <div id="tour-journey" className="scroll-mt-24">
              <MobileStatus
                location={location}
                weather={weather}
                funFacts={funFacts}
                city={city}
                accent={accent}
                orderValue={orderValue}
              />
            </div>
          </div>

          {/* Order items (tips open in a pop-up) */}
          <div id="tour-items" className="scroll-mt-24">
            <OrderItems items={items} accent={accent} sym={sym} />
          </div>

          {/* Promo / pairings */}
          <PromoCard brand={brand} />

          {/* Arrivals (hero banner removed on mobile) */}
          <div id="tour-arrivals" className="scroll-mt-24">
            <NewArrivals products={arrivals} accent={accent} sym={sym} />
          </div>
        </div>

        <TrackingFooter brand={brand} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animateReveal ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full overflow-x-hidden bg-[#f7f8fa]"
      style={{ zoom: 0.81, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <TrackingHeader brand={brand} />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6">
        <motion.div id="tour-status" className="scroll-mt-24" {...reveal(0.05)}>
          <StatusCards brand={brand} location={location} />
        </motion.div>

        {/* Two aligned rows: (Journey ∥ Weather+FunFact) then (Order Items ∥ DidYouKnow+OrderDetails+Promo) */}
        <div
          className={`mt-5 grid grid-cols-1 items-stretch gap-5 ${
            mobile ? "grid-cols-3" : "lg:grid-cols-3"
          }`}
        >
          {/* Row 1 */}
          <motion.div
            id="tour-journey"
            className={`min-w-0 scroll-mt-24 ${mobile ? "col-span-2" : "lg:col-span-2"}`}
            {...reveal(0.18)}
          >
            <ShipmentJourney location={location} accent={accent} />
          </motion.div>
          <motion.div className="flex min-w-0 flex-col gap-5" {...reveal(0.3)}>
            <div id="tour-weather" className="scroll-mt-24">
              <WeatherWidget location={location} weather={weather} accent={accent} />
            </div>
            <InfoCard
              icon={MapPinned}
              title={city ? `${city} Fun Fact` : "Local Fun Fact"}
              items={funFacts}
              accent={accent}
            />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            id="tour-items"
            className={`min-w-0 scroll-mt-24 ${mobile ? "col-span-2" : "lg:col-span-2"}`}
            {...reveal(0.42)}
          >
            <OrderItems items={items} accent={accent} sym={sym} />
          </motion.div>
          <motion.div className="flex min-w-0 flex-col gap-5" {...reveal(0.54)}>
            <div id="tour-didyouknow" className="scroll-mt-24">
              <InfoCard icon={Lightbulb} title="Did You Know?" items={brandFacts} accent={accent} />
            </div>
            <OrderDetails orderValue={orderValue} />
            <PromoCard brand={brand} className="flex-1" />
          </motion.div>
        </div>

        {/* Full-width sections below the two-column area */}
        <div className="mt-6 flex flex-col gap-6">
          <motion.div {...reveal(0.64)}>
            <HeroBanner brand={brand} copy={generated?.heroCopy} />
          </motion.div>
          <motion.div id="tour-arrivals" className="scroll-mt-24" {...reveal(0.72)}>
            <NewArrivals products={arrivals} accent={accent} sym={sym} />
          </motion.div>
        </div>
      </div>

      <TrackingFooter brand={brand} />
    </motion.div>
  );
}
