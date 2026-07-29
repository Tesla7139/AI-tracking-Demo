"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** White rounded card with an optional title + divider — the base surface used across the page. */
export function TrackingCard({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6 shadow-soft-md", className)}>
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {action}
          </div>
          <hr className="mt-3 border-border/60" />
        </>
      )}
      {children}
    </section>
  );
}

/**
 * Product/AI image. Shows `src` when provided (falling back to a brand-tinted tile
 * with `label` if the image fails to load), so the space is never empty.
 */
export function ImageTile({
  accent,
  className,
  label,
  src,
  alt = "",
}: {
  accent: string;
  className?: string;
  label?: React.ReactNode;
  src?: string;
  alt?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (src && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote stock/generated imagery
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setErrored(true)}
        className={cn("overflow-hidden rounded-lg bg-background-muted object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center overflow-hidden rounded-lg", className)}
      style={{ background: `linear-gradient(135deg, ${accent}1f, ${accent}0a)` }}
    >
      {label && (
        <span className="px-2 text-center text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
