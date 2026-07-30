"use client";

import type { WeatherIconKey } from "@/lib/site";

/**
 * SVG/CSS illustrations standing in for the Figma Lottie scenes (calendar / truck /
 * location pin / weather). Motion is driven by CSS @keyframes (see globals.css) so
 * the loops always run in production regardless of framer/reduced-motion behavior.
 */

/** Calendar whose page flips up from the top hinge and back, on a loop — EDD card. */
export function CalendarMotif({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center" style={{ perspective: 600 }}>
      <div className="relative" style={{ width: 78, height: 82 }}>
        {/* rings */}
        <span className="absolute left-[22%] top-0 h-3.5 w-1.5 rounded-full" style={{ background: accent }} />
        <span className="absolute right-[22%] top-0 h-3.5 w-1.5 rounded-full" style={{ background: accent }} />

        {/* body underneath */}
        <div className="absolute inset-x-0 bottom-0 top-2 overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: accent }}>
          <div className="h-4 w-full" style={{ background: accent }} />
          <div className="grid grid-cols-4 gap-x-2.5 gap-y-2 px-3 py-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full" style={{ background: accent, opacity: 0.55 }} />
            ))}
          </div>
        </div>

        {/* flipping page */}
        <div
          className="absolute inset-x-0 top-2 overflow-hidden rounded-xl border-2 bg-white"
          style={{
            height: "calc(100% - 0.5rem)",
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            borderColor: accent,
            animation: "cp-flip 2.9s ease-in-out infinite",
          }}
        >
          <div className="h-4 w-full" style={{ background: accent }} />
          <div className="grid grid-cols-4 gap-x-2.5 gap-y-2 px-3 py-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full" style={{ background: accent, opacity: 0.55 }} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.14), transparent 55%)" }} />
        </div>
      </div>
    </div>
  );
}

/** Delivery truck driving with spinning wheels + a bobbing pin — Status card. */
export function TruckMotif({ accent }: { accent: string }) {
  return (
    <svg width="112" height="94" viewBox="0 0 72 60">
      {/* bobbing pin */}
      <g style={{ animation: "cp-bob 1.6s ease-in-out infinite" }}>
        <circle cx="30" cy="12" r="7" fill={accent} />
        <path d="M30 26 L24 15 h12 Z" fill={accent} />
        <circle cx="30" cy="12" r="3" fill="#fff" />
      </g>
      {/* truck body */}
      <g style={{ animation: "cp-bob-sm 0.6s ease-in-out infinite" }}>
        <rect x="6" y="30" width="30" height="18" rx="3" fill={accent} />
        <path d="M36 34 h11 l7 7 v7 h-18 Z" fill={`${accent}cc`} />
        <rect x="40" y="36" width="9" height="6" rx="1.5" fill="#fff" opacity="0.85" />
      </g>
      {/* wheels: tire + rim + hub + spokes, each spinning about its own centre */}
      {[16, 46].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="50" r="6.5" fill="#1f2937" />
          <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "cp-spin 1.1s linear infinite" }}>
            <circle cx={cx} cy="50" r="4" fill="#4b5563" />
            <rect x={cx - 0.6} y="45.6" width="1.2" height="8.8" rx="0.6" fill="#e5e7eb" />
            <rect x={cx - 4.4} y="49.4" width="8.8" height="1.2" rx="0.6" fill="#e5e7eb" />
            <circle cx={cx} cy="50" r="1.5" fill="#fff" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Location pin spinning around its vertical axis — Latest Update card. */
export function PinMotif({ accent }: { accent: string }) {
  return (
    <div className="flex h-[96px] w-[92px] items-center justify-center" style={{ perspective: 900 }}>
      <div
        style={{
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.18))",
          animation: "cp-spin-y 3.6s linear infinite",
        }}
      >
        <svg width="68" height="88" viewBox="0 0 40 52">
          <path d="M20 2 C9 2 2 10 2 20 C2 32 20 50 20 50 C20 50 38 32 38 20 C38 10 31 2 20 2 Z" fill={accent} />
          <circle cx="20" cy="19" r="7" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

/** Weather scene in a gradient disc — sun rotates, clouds drift, rain/snow falls. */
export function WeatherMotif({ iconKey, isDay = true }: { iconKey: WeatherIconKey; isDay?: boolean }) {
  const sunny = iconKey === "clear" && isDay;
  const snowy = iconKey === "snow";
  const stormy = iconKey === "thunder";
  const rain = iconKey === "rain" || iconKey === "cloudy" || stormy;

  return (
    <div
      className="relative flex size-[150px] shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ background: sunny ? "linear-gradient(160deg,#ffe08a,#ff9e5e)" : "linear-gradient(160deg,#5b6b9c,#2b2f52)" }}
    >
      {/* sun / moon */}
      {sunny ? (
        <svg width="150" height="150" viewBox="0 0 120 120" className="absolute" style={{ animation: "cp-spin 30s linear infinite" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="58" y="14" width="4" height="12" rx="2" fill="#fff8e1" opacity="0.9" transform={`rotate(${i * 30} 60 60)`} />
          ))}
        </svg>
      ) : (
        <div className="absolute right-9 top-8 size-9 rounded-full bg-[#f4f6ff]" />
      )}
      {sunny && <div className="absolute size-12 rounded-full bg-[#fff4cf] shadow-[0_0_24px_8px_rgba(255,244,207,0.7)]" />}

      {/* drifting cloud */}
      {!sunny && (
        <div className="absolute bottom-8 left-6" style={{ animation: "cp-drift 5s ease-in-out infinite" }}>
          <div className="relative h-6 w-16">
            <span className="absolute bottom-0 h-5 w-16 rounded-full bg-white" />
            <span className="absolute bottom-2 left-3 size-8 rounded-full bg-white" />
            <span className="absolute bottom-2 left-8 size-6 rounded-full bg-white" />
          </div>
        </div>
      )}

      {/* rain — faint diagonal streaks + glossy falling drops */}
      {rain && (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={`streak-${i}`}
              className="absolute top-5 w-px rounded-full bg-white/25"
              style={{ height: 16, left: 26 + i * 15, animation: `cp-streak 0.85s linear ${i * 0.12}s infinite` }}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={`drop-${i}`}
              className="absolute"
              style={{
                left: 70 + i * 15,
                bottom: 42,
                width: 8,
                height: 11,
                background: "linear-gradient(180deg,#dcecff,#7fb0ff)",
                borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
                boxShadow: "inset -1px -1px 2px rgba(255,255,255,0.55)",
                animation: `cp-rain 1.4s ease-in ${i * 0.32}s infinite`,
              }}
            />
          ))}
        </>
      )}
      {snowy &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute bottom-4 size-1.5 rounded-full bg-white"
            style={{ left: 44 + i * 12, animation: `cp-snow 1.4s ease-in ${i * 0.3}s infinite` }}
          />
        ))}
      {stormy && <div className="absolute bottom-3 left-1/2 h-4 w-2 -translate-x-1/2 bg-[#ffd54a]" style={{ clipPath: "polygon(50% 0, 0 60%, 45% 60%, 30% 100%, 100% 40%, 55% 40%)" }} />}
    </div>
  );
}
