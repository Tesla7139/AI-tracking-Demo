"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";

/**
 * A realistic phone device shell (bezel, side buttons, notch, status bar) that wraps
 * the demo screen for the mobile preview. `children` is the scrollable screen content.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full w-[360px] max-w-full shrink-0 flex-col">
      {/* Side buttons */}
      <span className="absolute -left-[3px] top-[96px] h-8 w-[3px] rounded-l bg-neutral-700" />
      <span className="absolute -left-[3px] top-[150px] h-14 w-[3px] rounded-l bg-neutral-700" />
      <span className="absolute -left-[3px] top-[220px] h-14 w-[3px] rounded-l bg-neutral-700" />
      <span className="absolute -right-[3px] top-[180px] h-24 w-[3px] rounded-r bg-neutral-700" />

      {/* Bezel */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.8rem] bg-neutral-900 p-[9px] shadow-[0_45px_130px_-25px_rgba(0,0,0,0.75)] ring-1 ring-black/40">
        {/* Screen */}
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2.3rem] bg-white">
          {/* Status bar + dynamic island */}
          <div className="relative z-20 flex h-9 shrink-0 items-center justify-between bg-white px-6 text-[12px] font-semibold text-neutral-900">
            <span className="tabular-nums">9:41</span>
            <span className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1.5">
              <Signal className="size-3.5" />
              <Wifi className="size-3.5" />
              <BatteryFull className="size-5" />
            </span>
          </div>

          {/* Scrollable screen content */}
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
