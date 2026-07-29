"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Navbar } from "@/components/layout/Navbar";
import { LaunchExperience } from "@/components/tracking/LaunchExperience";
import { useBrand } from "@/hooks/useBrand";
import { useWeather } from "@/hooks/useWeather";
import { useGenerated } from "@/hooks/useGenerated";
import type { GeoLocation } from "@/lib/site";

/**
 * Home + demo launcher. When `initialStore` is provided (deep link like
 * `/gullylabs.com`), it auto-submits that store and jumps straight into the demo.
 */
export function HomeClient({ initialStore }: { initialStore?: string }) {
  const [value, setValue] = useState(initialStore ?? "");
  const [highlight, setHighlight] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, brand, submittedUrl, submit, reset } = useBrand();
  const weather = useWeather(brand?.lat, brand?.lon);
  const generated = useGenerated(brand);

  // Deep link: auto-open the demo for the store named in the URL.
  useEffect(() => {
    if (initialStore) submit(initialStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The delivery location is the brand's own city (derived from its store currency).
  const location: GeoLocation | null = brand
    ? {
        city: brand.city,
        region: null,
        country: brand.country,
        countryCode: null,
        lat: brand.lat,
        lon: brand.lon,
        timezone: brand.timezone,
      }
    : null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(value);
  };

  // "Product Tour" → focus + flash the store-URL box so it's clear where to start.
  const focusUrl = () => {
    inputRef.current?.focus();
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1400);
  };

  // Once a store is submitted, hand off to the launch flow (loading → laptop → tracking).
  if (status !== "idle") {
    return (
      <LaunchExperience
        status={status}
        brand={brand}
        submittedUrl={submittedUrl}
        location={location}
        weather={weather}
        generated={generated}
        onReset={() => {
          reset();
          setValue("");
        }}
      />
    );
  }

  const loading = false;

  return (
    <div className="bg-white">
      <Navbar onProductTour={focusUrl} />
      <Container className="flex min-h-[calc(100svh-73px)] flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center"
        >
          <h1
            className="text-balance font-medium text-[#0a0a0a]"
            style={{
              fontSize: "clamp(2rem, 5vw, 5.25rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.022em",
            }}
          >
            Improve <span className="text-primary">Engagement</span> and increase{" "}
            <span className="text-primary">upsells</span> by 8%
          </h1>
          <p
            className="mt-7 max-w-xl text-muted-foreground"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.4rem)" }}
          >
            Enter your store URL to have a personalized demo tailored to your store.
          </p>

          <motion.form
            onSubmit={onSubmit}
            animate={highlight ? { x: [0, -7, 7, -5, 5, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className={`mt-9 flex w-full max-w-2xl items-center gap-2 rounded-full border bg-white p-2 transition-all ${
              highlight
                ? "border-primary shadow-[0_18px_54px_-14px_rgba(21,95,255,0.5)] ring-4 ring-primary/30"
                : "border-border shadow-[0_10px_36px_-14px_rgba(21,95,255,0.25)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15"
            }`}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your store URL"
              autoFocus
              inputMode="url"
              disabled={loading}
              className="pill-input min-w-0 flex-1 bg-transparent px-6 text-base text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Loading
                </>
              ) : (
                <>
                  See it live <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </motion.form>
        </motion.div>
      </Container>
    </div>
  );
}
