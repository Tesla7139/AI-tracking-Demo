"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Right-rail info card (Fun Fact / Did You Know) — icon + title + a rotating list
 * of blurbs with pagination dots. Static content for now; an AI source can feed
 * `items` later without changing the UI.
 */
export function InfoCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  accent: string;
}) {
  const [i, setI] = useState(0);
  const list = items.length ? items : [""];
  const idx = i % list.length;

  // Auto-advance through the blurbs (pauses nothing fancy — just cycles).
  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft-md">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[rgba(17,17,17,0.06)] text-foreground">
          <Icon className="size-5" />
        </span>
        <p className="text-base font-bold text-foreground">{title}</p>
      </div>

      <div className="mt-4 border-t border-border/60 pt-4">
        {/* All blurbs stacked in one grid cell → the card is as tall as the LONGEST
            blurb and never resizes as it rotates (only the active one is visible). */}
        <div className="grid">
          {list.map((item, n) => (
            <p
              key={n}
              aria-hidden={n !== idx}
              className={`col-start-1 row-start-1 text-sm leading-relaxed text-foreground transition-opacity duration-500 ${
                n === idx ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {item}
            </p>
          ))}
        </div>

        {list.length > 1 && (
          <div className="mt-3 flex gap-1.5">
            {list.map((_, n) => (
              <button
                key={n}
                aria-label={`Show item ${n + 1}`}
                onClick={() => setI(n)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: n === idx ? 20 : 6,
                  background: n === idx ? accent : "var(--border)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
