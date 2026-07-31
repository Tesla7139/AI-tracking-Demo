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
  const arrivals = buildNewArrivals(brand.products);

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

  return (
    <motion.div
      initial={animateReveal ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full overflow-x-hidden bg-[#f7f8fa]"
      style={{ zoom: mobile ? 0.5 : 0.81, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <TrackingHeader brand={brand} />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6">
        <motion.div id="tour-status" className="scroll-mt-24" {...reveal(0.05)}>
          <StatusCards brand={brand} location={location} />
        </motion.div>

        {/* Two aligned rows: (Journey ∥ Weather+FunFact) then (Order Items ∥ DidYouKnow+OrderDetails+Promo) */}
        <div
          className={`mt-5 grid grid-cols-1 items-stretch gap-5 ${
            mobile ? "grid-cols-[minmax(0,1fr)_300px]" : "lg:grid-cols-[minmax(0,1fr)_320px]"
          }`}
        >
          {/* Row 1 */}
          <motion.div id="tour-journey" className="min-w-0 scroll-mt-24" {...reveal(0.18)}>
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
          <motion.div id="tour-items" className="min-w-0 scroll-mt-24" {...reveal(0.42)}>
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
