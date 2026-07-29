"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  ArrowLeft,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  ExternalLink,
  FolderInput,
  Forward,
  Gift,
  Mail,
  MoreVertical,
  Phone,
  Printer,
  Reply,
  ReplyAll,
  Smile,
  Sparkles,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import type { Brand } from "@/lib/site";
import { currencySymbol } from "@/lib/site";
import { brandDidYouKnows, buildNewArrivals, buildOrderItems, orderDetails } from "@/lib/tracking";
import type { Generated } from "@/hooks/useGenerated";
import { SOCIALS } from "./TrackingFooter";

const CUSTOMER = "Alex Morgan";

/**
 * The AI Email: the same personalized post-purchase experience from the tracking
 * page, re-flowed into a branded order email. Rendered INSIDE the demo screen (in
 * place of the tracking page) inside a realistic Gmail reading pane.
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
  const initial = (brand.brandName[0] || "?").toUpperCase();

  const IconBtn = ({
    children,
    onClick,
    title,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
    >
      {children}
    </button>
  );
  const Sep = () => <span className="mx-1 h-5 w-px bg-neutral-200" />;
  const ic = "size-[18px]";

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
    <div className="min-h-full bg-white" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* --- Gmail chrome (sticky) --- */}
      <div className="sticky top-0 z-10 bg-white">
        {/* toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center">
            <IconBtn title="Back to tracking" onClick={onClose}>
              <ArrowLeft className={ic} />
            </IconBtn>
            <Sep />
            <IconBtn title="Archive"><Archive className={ic} /></IconBtn>
            <IconBtn title="Report spam"><CircleAlert className={ic} /></IconBtn>
            <IconBtn title="Delete"><Trash2 className={ic} /></IconBtn>
            <Sep />
            <IconBtn title="Mark as unread"><Mail className={ic} /></IconBtn>
            <IconBtn title="Snooze"><Clock className={ic} /></IconBtn>
            <IconBtn title="Add to Tasks"><CheckCheck className={ic} /></IconBtn>
            <Sep />
            <IconBtn title="Move to"><FolderInput className={ic} /></IconBtn>
            <IconBtn title="Labels"><Tag className={ic} /></IconBtn>
            <IconBtn title="More"><MoreVertical className={ic} /></IconBtn>
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <span className="mr-1">4 of 313</span>
            <IconBtn title="Newer"><ChevronLeft className={ic} /></IconBtn>
            <IconBtn title="Older"><ChevronRight className={ic} /></IconBtn>
          </div>
        </div>

        {/* subject */}
        <div className="flex items-center justify-between gap-3 px-6 pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-xl text-neutral-900">
              Your {brand.brandName} order is on the way!
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
              Inbox <span className="text-neutral-400">✕</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-neutral-500">
            <IconBtn title="Print"><Printer className={ic} /></IconBtn>
            <IconBtn title="Open in new window"><ExternalLink className={ic} /></IconBtn>
          </div>
        </div>

        {/* sender */}
        <div className="flex items-start justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: accent }}
            >
              {initial}
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm text-neutral-900">
                <span className="font-semibold">{brand.brandName}</span>{" "}
                <span className="text-neutral-500">&lt;{email}&gt;</span>
              </p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                to me <ChevronDown className="size-3" />
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-neutral-500">
            <span className="mr-1 hidden text-xs sm:inline">10:24 AM (2 hours ago)</span>
            <IconBtn title="Star"><Star className={ic} /></IconBtn>
            <IconBtn title="React"><Smile className={ic} /></IconBtn>
            <IconBtn title="Reply"><Reply className={ic} /></IconBtn>
            <IconBtn title="More"><MoreVertical className={ic} /></IconBtn>
          </div>
        </div>
        <div className="border-b border-neutral-200" />
      </div>

      {/* --- The branded email document --- */}
      <div className="mx-auto w-full max-w-[620px] px-4 py-6">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {/* Logo */}
          <div className="flex justify-center px-6 py-8">
            <Logo />
          </div>

          {/* Status hero */}
          <div className="mx-6 rounded-2xl bg-neutral-100 px-6 py-8 text-center">
            <p className="text-xl text-neutral-800">Hello {CUSTOMER}! Your order is</p>
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
            {/* Fixed-height scroll so the box stays compact as items grow (matches the email design). */}
            <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-1">

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

        {/* Gmail reply actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ReplyBtn icon={<Reply className="size-4" />}>Reply</ReplyBtn>
          <ReplyBtn icon={<ReplyAll className="size-4" />}>Reply all</ReplyBtn>
          <ReplyBtn icon={<Forward className="size-4" />}>Forward</ReplyBtn>
        </div>
      </div>
    </div>
  );
}

function ReplyBtn({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
    >
      {icon} {children}
    </button>
  );
}
