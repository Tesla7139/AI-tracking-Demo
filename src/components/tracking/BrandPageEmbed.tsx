"use client";

import { useEffect, useRef, useState } from "react";
import type { Brand } from "@/lib/site";
import { useDevice } from "./device";

// Hand-built tracking pages for specific brands, served from /public. When a brand
// matches, the demo shows this page inside the device frame instead of the generated
// TrackingPage.
// `variant` selects the matching hand-built content for the mobile TrackingPage.
const BRAND_PAGES: { match: RegExp; src: string; variant: "ryleeandcru" }[] = [
  // Rylee + Cru — personalised per-child picks, birthday edit, sibling set.
  { match: /(^|\.)ryleeandcru\./i, src: "/brands/ryleeandcru/index.html", variant: "ryleeandcru" },
];

export function brandPageFor(brand: Brand): (typeof BRAND_PAGES)[number] | null {
  if (!brand.url) return null;
  try {
    const host = new URL(brand.url).hostname;
    return BRAND_PAGES.find((p) => p.match.test(host)) ?? null;
  } catch {
    return null;
  }
}

/** Same-origin iframe sized to its content, so the frame's own scroll container
 *  works exactly as it does for TrackingPage. The hand-built pages are desktop
 *  layouts, so mobile (real device or mobile preview) shows `mobile` instead. */
export function BrandPageEmbed({
  src,
  title,
  mobile,
}: {
  src: string;
  title: string;
  mobile: React.ReactNode;
}) {
  const device = useDevice();
  if (device === "mobile") return <>{mobile}</>;
  return <BrandPageFrame src={src} title={title} />;
}

// The hand-built pages switch to a stacked tablet layout below 1056px, but the
// desktop preview frame is narrower than that. Lay the page out at this width
// and scale it down to the frame so it keeps the exact desktop composition.
const LAYOUT_WIDTH = 1104;

function BrandPageFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(900);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const sync = () => setScale(Math.min(1, box.clientWidth / LAYOUT_WIDTH));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let ro: ResizeObserver | null = null;
    const attach = () => {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      const sync = () => setHeight(doc.body.scrollHeight);
      sync();
      ro?.disconnect();
      ro = new ResizeObserver(sync);
      ro.observe(doc.body);
    };
    frame.addEventListener("load", attach);
    attach();
    return () => {
      frame.removeEventListener("load", attach);
      ro?.disconnect();
    };
  }, [src]);

  return (
    <div ref={boxRef} className="w-full overflow-hidden" style={{ height: height * scale }}>
      <iframe
        ref={ref}
        src={src}
        title={title}
        scrolling="no"
        style={{
          width: scale < 1 ? LAYOUT_WIDTH : "100%",
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        className="block border-0"
      />
    </div>
  );
}
