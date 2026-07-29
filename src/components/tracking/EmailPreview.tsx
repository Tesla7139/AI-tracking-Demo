"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Mail, Phone, Sparkles } from "lucide-react";
import type { Brand } from "@/lib/site";
import { currencySymbol } from "@/lib/site";
import { brandDidYouKnows, buildNewArrivals, buildOrderItems, orderDetails } from "@/lib/tracking";
import type { Generated } from "@/hooks/useGenerated";
import { SOCIALS } from "./TrackingFooter";

const CUSTOMER = "Alex Morgan";

/**
 * The AI Email: the same personalized post-purchase experience from the tracking
 * page, re-flowed into a branded order email. Rendered INSIDE the demo screen (in
 * place of the tracking page) in a Gmail-style reading pane, so it feels like part
 * of the same product.
 */
export function EmailView({
  brand,
  generated,
  onClose,
}: {
  brand: Brand;
  generated: Generated | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = brand.brandColor;
  const sym = currencySymbol(brand.currency);
  const items = buildOrderItems(brand.products).map((it) => {
    const rec = generated?.upsells?.find((u) => u.forItem === it.name);
    return rec ? { ...it, rec: { ...it.rec, name: rec.name, blurb: rec.blurb } } : it;
  });
  const arrivals = buildNewArrivals(brand.products).slice(0, 6);
  const brandFact = generated?.brandFacts?.[0] || brandDidYouKnows(brand.brandName)[0];
  const host = (() => {
    try {
      return new URL(brand.url || "").hostname.replace(/^www\./, "");
    } catch {
      return `${brand.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;
    }
  })();
  const email = `hello@${host}`;

  const Btn = ({ children }: { children: React.ReactNode }) => (
    <a
      href={brand.url || "#"}
      target="_blank"
      rel="noreferrer"
      className="mx-auto flex w-fit items-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white"
      style={{ background: accent }}
    >
      {children}
    </a>
  );

  const Logo = () =>
    brand.logo ? (
      // eslint-disable-next-line @next/next/no-img-element -- remote brand logo
      <img src={brand.logo} alt={brand.brandName} className="mx-auto max-h-10 w-auto max-w-[200px] object-contain" referrerPolicy="no-referrer" />
    ) : (
      <span
        className="text-2xl font-bold tracking-tight"
        style={{ color: accent, fontFamily: "var(--font-logo), var(--font-inter), sans-serif" }}
      >
        {brand.brandName}
      </span>
    );

  return (
    <div className="min-h-full bg-neutral-100" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Gmail-style header — sticks to the top of the demo screen while the email scrolls */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
        <button
          onClick={onClose}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200"
        >
          <ArrowLeft className="size-4" /> Back to tracking
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-neutral-900">
            Your {brand.brandName} order is on the way!
          </p>
          <p className="truncate text-xs text-neutral-500">
            {brand.brandName} &lt;{email}&gt; · to you
          </p>
        </div>
      </div>

      {/* Email reading pane — the branded email as a centered document */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto my-6 w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
      >
        {/* Email body */}
        <div className="bg-white">
          {/* Logo */}
          <div className="flex justify-center px-6 py-8">
            <Logo />
          </div>

          {/* Status hero */}
          <div className="mx-6 rounded-2xl bg-neutral-100 px-6 py-8 text-center">
            <p className="text-xl text-neutral-800">
              Hello {CUSTOMER}! Your order is
            </p>
            <p className="mt-3 text-lg font-bold" style={{ color: accent }}>
              Shipped
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
              Your order has shipped and is on its way to you via {orderDetails.carrier}.
            </p>
            <div className="mt-6">
              <Btn>Track Your Order</Btn>
            </div>
          </div>

          {/* Order items */}
          <div className="mx-6 mt-5 rounded-2xl bg-neutral-100 px-5 py-7">
            <p className="text-center text-lg text-neutral-800">Your Item in this Order</p>
            <p className="mt-1 text-center text-sm text-neutral-500">Order Id {orderDetails.orderId}</p>
            <div className="mt-5 space-y-4">
              {items.map((it, i) => (
                <div key={i} className="rounded-xl bg-white p-4">
                  <p className="mb-3 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                    Item {i + 1}/{items.length}
                  </p>
                  <div className="flex items-start gap-4">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote product image
                      <img src={it.image} alt="" className="size-16 shrink-0 rounded-lg border border-neutral-200 object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="size-16 shrink-0 rounded-lg bg-neutral-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{it.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">Qty: {it.qty || 1}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-neutral-800">
                      {sym}{it.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-neutral-50 p-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-800">Pair tip:</span> {it.rec.blurb}
                    </p>
                  </div>
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-neutral-50 p-3">
                    <Gift className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
                    <p className="text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-800">Care Tip:</span> {it.careTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral */}
          <div className="mx-6 mt-5 rounded-2xl bg-neutral-100 px-6 py-8 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full text-lg" style={{ background: `${accent}22`, color: accent }}>
              $
            </div>
            <p className="mt-4 text-lg font-bold" style={{ color: accent }}>
              Share the love with a friend
            </p>
            <p className="mt-2 text-sm text-neutral-600">Give friends</p>
            <p className="mx-auto mt-3 w-fit rounded-md px-4 py-2 text-2xl font-extrabold" style={{ background: `${accent}22`, color: accent }}>
              5% OFF
            </p>
            <p className="mt-3 text-sm text-neutral-600">on their first {brand.brandName} order.</p>
            <p className="mt-2 text-sm text-neutral-600">
              You get <span className="font-bold" style={{ color: accent }}>{sym}50</span> when they spend{" "}
              <span className="font-bold" style={{ color: accent }}>{sym}500</span> or more.
            </p>
            <div className="mt-5">
              <Btn>Refer &amp; Earn</Btn>
            </div>
          </div>

          {/* Did you know */}
          <div className="mx-6 mt-5 rounded-2xl bg-neutral-100 px-6 py-8 text-center">
            <p className="text-lg text-neutral-800">Did you Know?</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{brandFact}</p>
          </div>

          {/* Thank you */}
          <div className="px-6 py-9 text-center">
            <p className="text-xl text-neutral-800">Thank you for shopping with us!</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              Thanks a million for your {brand.brandName} purchase! We&apos;re excited for you to enjoy it.
            </p>
          </div>

          {/* New arrivals */}
          {arrivals.length > 0 && (
            <div className="mx-6 rounded-2xl border border-neutral-200 px-5 py-6">
              <p className="border-b border-neutral-200 pb-3 text-base font-bold text-neutral-900">
                Explore Our New Arrivals
              </p>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {arrivals.map((p, i) => (
                  <div key={i} className="w-36 shrink-0 rounded-lg border border-neutral-200 p-2">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- remote product image
                      <img src={p.image} alt="" className="h-24 w-full rounded object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-24 w-full rounded bg-neutral-100" />
                    )}
                    <p className="mt-2 truncate text-xs font-semibold text-neutral-800">{p.name}</p>
                    <p className="text-xs font-bold text-neutral-900">{sym}{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Need assistance */}
          <div className="px-6 py-9 text-center">
            <p className="text-xl text-neutral-800">Need Any Assistance?</p>
            <p className="mt-2 text-sm text-neutral-600">If you need any help with your order, feel free to contact.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-left">
                <Phone className="size-5 shrink-0" style={{ color: accent }} />
                <div>
                  <p className="text-xs text-neutral-500">Call Us</p>
                  <p className="text-sm font-semibold text-neutral-800">+1 888-502-2236</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-left">
                <Mail className="size-5 shrink-0" style={{ color: accent }} />
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">Email Us</p>
                  <p className="truncate text-sm font-semibold text-neutral-800">{email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Branded footer */}
          <div className="px-6 py-8 text-center text-white" style={{ background: accent }}>
            <p className="text-sm font-semibold">Stay connected with us!</p>
            <div className="mt-4 flex items-center justify-center gap-5">
              {SOCIALS.map(({ label, Mark }) => (
                <span key={label} className="opacity-90" aria-label={label}>
                  <Mark />
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-white/80">© 2026 {brand.brandName}. All rights reserved.</p>
            <p className="mt-4 text-[11px] font-bold tracking-wide text-white">Powered By CLICKPOST</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
