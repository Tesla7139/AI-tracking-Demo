"use client";

import { useState } from "react";
import { ArrowRight, Cake, Check, Gift, Heart, Plus, Sparkles } from "lucide-react";
import {
  EVERYDAY,
  FESTIVE,
  KIDS,
  KID_PROMO,
  SIBLING_SET,
  kidByKey,
  upcomingBirthday,
  type Kid,
  type KidProduct,
} from "@/lib/brands/ryleeandcru";

// Mobile-only Rylee + Cru sections, styled to match the generated mobile tracking
// page (rounded white cards, bold section headers, accent-coloured CTAs).

const money = (n: number) => `$${n.toFixed(2)}`;
const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

function Avatar({ kid, size = 32 }: { kid: Kid; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-serif italic"
      style={{ width: size, height: size, fontSize: size * 0.5, background: kid.accentSoft, color: kid.accent }}
    >
      {kid.name[0]}
    </span>
  );
}

function AddButton({ label, accent, className = "" }: { label: string; accent: string; className?: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setAdded(true)}
      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold text-white transition-transform active:scale-[0.98] ${className}`}
      style={{ background: accent }}
    >
      {added ? (
        <>
          <Check className="size-4" /> Added
        </>
      ) : (
        label
      )}
    </button>
  );
}

function PickCard({ product, kid, accent }: { product: KidProduct; kid: Kid; accent: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex w-[150px] shrink-0 flex-col rounded-xl border border-border bg-card p-2.5 shadow-soft-sm">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
        <img src={product.img} alt={`${product.name} – ${product.colour}`} className="aspect-square w-full rounded-lg object-cover" />
        <span
          className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: product.low ? "#c2410c" : kid.accent }}
        >
          {product.stock}
        </span>
        <button
          type="button"
          aria-label={`Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => setSaved((s) => !s)}
          className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90"
        >
          <Heart className="size-3.5" style={{ color: kid.accent, fill: saved ? kid.accent : "none" }} />
        </button>
      </div>
      <p className="mt-2 line-clamp-1 text-[13px] font-semibold text-foreground">{product.name}</p>
      <p className="text-[11px] text-muted-foreground">{product.colour}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{money(product.price)}</p>
      <AddButton label="Quick add" accent={accent} className="mt-2" />
    </div>
  );
}

function KidPicks({ kid, accent }: { kid: Kid; accent: string }) {
  const [wrapped, setWrapped] = useState(false);
  const bday = upcomingBirthday(kid);
  const byId = Object.fromEntries(kid.products.map((p) => [p.id, p]));
  const look = bday ? kid.birthdayLook : kid.look;
  const lookItems = look.ids.map((id) => byId[id]);
  const lookFull = lookItems.reduce((s, p) => s + p.price, 0);
  const picks = kid.picks.map((id) => byId[id]);
  const when = bday && (bday.days === 0 ? "today" : bday.days === 1 ? "tomorrow" : `in ${bday.days} days`);

  return (
    <section className="rounded-2xl border border-border bg-card p-3 shadow-soft-md">
      <div className="flex items-center gap-2.5">
        <Avatar kid={kid} />
        <h2 className="text-lg font-bold text-foreground">Picked for {kid.name}</h2>
        <span className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: kid.accentSoft, color: kid.accent }}>
          Size {kid.size}
        </span>
      </div>

      {bday && (
        <div
          className="mt-3 rounded-xl border border-dashed p-3"
          style={{ borderColor: kid.accentMid, background: `linear-gradient(100deg, ${kid.accentSoft}, #fff 85%)` }}
        >
          <div className="flex gap-2.5">
            <Cake className="size-5 shrink-0" style={{ color: kid.accent }} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {kid.name}&apos;s birthday is {when}{" "}
                <span className="font-normal text-muted-foreground">· {fmtDate(bday.date)}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {bday.tooLate ? (
                  "Choose express delivery at checkout to get it there in time."
                ) : (
                  <>
                    Order by <b className="text-foreground">{fmtDate(bday.orderBy)}</b> to have it delivered before the big day.
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-pressed={wrapped}
            onClick={() => setWrapped((w) => !w)}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border bg-white py-2 text-[13px] font-semibold"
            style={{ borderColor: kid.accentMid, color: kid.accent }}
          >
            <Gift className="size-4" /> {wrapped ? "Gift wrap added" : "Add free gift wrap"}
          </button>
        </div>
      )}

      {/* Complete the look — bundle of three pieces */}
      <div className="mt-3 rounded-xl p-3" style={{ background: kid.accentSoft }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: kid.accent }}>
          {bday ? "Birthday edit" : "Complete the look"} · {lookItems.length} pieces
        </p>
        <p className="mt-0.5 text-base font-bold text-foreground">{look.title}</p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {lookItems.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element -- static brand asset
            <img key={p.id} src={p.img} alt={`${p.name} – ${p.colour}`} className="aspect-square w-full rounded-lg bg-white object-cover" />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{lookItems.map((p) => p.name).join(", ")}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">{money(look.bundle)}</span>
          <span className="text-xs text-muted-foreground line-through">{money(lookFull)}</span>
          <span className="text-xs font-semibold text-emerald-600">Save {money(lookFull - look.bundle)}</span>
        </div>
        <AddButton label={`Add the look${wrapped ? " · gift-wrapped" : ""}`} accent={accent} className="mt-2.5 w-full py-2.5" />
      </div>

      <div className="thin-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
        {picks.map((p) => (
          <PickCard key={p.id} product={p} kid={kid} accent={accent} />
        ))}
      </div>
    </section>
  );
}

/** One "Picked for" card per child; a child with a birthday coming up goes first. */
export function KidsPicks({ accent }: { accent: string }) {
  const kids = [...KIDS].sort((a, b) => Number(!!upcomingBirthday(b)) - Number(!!upcomingBirthday(a)));
  return (
    <>
      {kids.map((kid) => (
        <KidPicks key={kid.key} kid={kid} accent={accent} />
      ))}
    </>
  );
}

export function KidPromo({ accent }: { accent: string }) {
  const kid = kidByKey(KID_PROMO.kid);
  return (
    <a href="#" className="relative block h-[220px] overflow-hidden rounded-2xl text-white shadow-soft-md">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src={KID_PROMO.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
      <div className="relative flex h-full max-w-[70%] flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Picked for {kid.name}</p>
        <p className="mt-1 text-xl font-bold leading-tight">{KID_PROMO.title}</p>
        <p className="mt-1 text-xs text-white/80">{KID_PROMO.sub}</p>
        <span
          className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white"
          style={{ background: accent }}
        >
          {KID_PROMO.cta} <ArrowRight className="size-3.5" />
        </span>
      </div>
    </a>
  );
}

export function SiblingSet({ accent }: { accent: string }) {
  const full = SIBLING_SET.items.reduce((s, it) => s + it.price, 0);
  const bundle = Math.round(full * (1 - SIBLING_SET.bundleSave) * 100) / 100;
  const names = SIBLING_SET.items.map((it) => kidByKey(it.kid).name).join(" & ");
  return (
    <section className="relative overflow-hidden rounded-2xl text-white shadow-soft-md">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src={SIBLING_SET.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
      <div className="relative p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Sibling set</p>
        <p className="mt-1 text-xl font-bold leading-tight">
          Match {names} in <span className="italic">{SIBLING_SET.print}</span>
        </p>
        <p className="mt-1 text-xs text-white/80">Matching pieces in both their sizes, ready for holiday photos together.</p>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {SIBLING_SET.items.map((it, i) => {
            return [
              i > 0 && <Plus key={`plus-${i}`} className="size-4 text-white" />,
              <div key={it.name} className="rounded-xl bg-white p-2 text-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
                <img src={it.img} alt={`${it.name} – ${SIBLING_SET.print}`} className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1.5 line-clamp-1 text-xs font-semibold">{it.name}</p>
                <p className="text-xs font-bold">{money(it.price)}</p>
              </div>,
            ];
          })}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold">{money(bundle)}</span>
          <span className="text-xs text-white/70 line-through">{money(full)}</span>
          <span className="text-xs font-semibold text-emerald-300">You save {money(full - bundle)}</span>
        </div>
        <AddButton label="Add both to bag" accent={accent} className="mt-2.5 w-full py-3 text-sm" />
      </div>
    </section>
  );
}

export function FestivePicks({ accent }: { accent: string }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const when = new Date(today.getFullYear(), FESTIVE.month - 1, FESTIVE.day);
  if (when < today) when.setFullYear(when.getFullYear() + 1);
  const daysAway = Math.round((when.getTime() - today.getTime()) / 86400000);
  const day =
    daysAway === 0
      ? "tonight"
      : daysAway === 1
      ? "tomorrow"
      : daysAway < 7
      ? `this ${when.toLocaleDateString("en-US", { weekday: "long" })}`
      : when.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <section className="overflow-hidden rounded-2xl p-4 text-white shadow-soft-md" style={{ background: "linear-gradient(160deg, #23182e, #3b2440 60%, #5a2e1f)" }}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
        <Sparkles className="size-3.5" /> Festive season
      </p>
      <p className="mt-1 text-xl font-bold leading-tight">
        {FESTIVE.name} is <span className="text-[#f6a04d]">{day}</span>
      </p>
      <p className="mt-1 text-xs text-white/75">{FESTIVE.sub}</p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {FESTIVE.items.map((it) => (
          <div key={it.name} className="flex flex-col rounded-xl bg-white p-2 text-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
            <img src={it.img} alt={it.name} className="aspect-square w-full rounded-lg object-cover" />
            <p className="mt-1.5 line-clamp-2 text-xs font-semibold">{it.name}</p>
            <p className="mt-0.5 text-sm font-bold">{money(it.price)}</p>
            <AddButton label="Add to bag" accent={accent} className="mt-auto pt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function EverydayBanner({ accent }: { accent: string }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#f0ece6] shadow-soft-md">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src={EVERYDAY.img} alt="A mother and son in a field of tall grass, wearing Rylee + Cru" className="aspect-[4/3] w-full object-cover" />
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
          Rylee + Cru
        </p>
        <p className="mt-1 text-xl font-bold leading-tight text-foreground">{EVERYDAY.title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{EVERYDAY.body}</p>
        <div className="mt-3 flex gap-2">
          {EVERYDAY.ctas.map((c) => (
            <a
              key={c}
              href="#"
              className="rounded-md px-5 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ background: accent }}
            >
              {c}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
