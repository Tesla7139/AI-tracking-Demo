"use client";

import type { Brand, GeoLocation } from "@/lib/site";
import { estimatedDelivery, orderMock } from "@/lib/tracking";
import { darken } from "@/lib/colors";
import { CalendarMotif, TruckMotif, PinMotif } from "./animations";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[168px] overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft-md">
      {children}
    </div>
  );
}

/** Large soft highlight circle bleeding off the card's bottom-right corner, illustration on top. */
function Illo({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute -bottom-9 -right-6 flex size-[188px] items-center justify-center rounded-full bg-[rgba(17,17,17,0.05)]">
      {children}
    </div>
  );
}

export function StatusCards({
  brand,
  location,
}: {
  brand: Brand;
  location: GeoLocation | null;
}) {
  const accent = brand.brandColor;
  const ink = darken(accent, 0.45); // dark brand shade for headings (e.g. newton's deep green)
  const edd = estimatedDelivery();
  const city = location?.city ?? "your city";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Left pair: EDD + Status (sits over the main left column) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* Estimated delivery */}
      <Card>
        <Illo>
          <CalendarMotif accent={accent} />
        </Illo>
        <div className="relative max-w-[62%]">
          <p className="text-sm text-muted-foreground">Estimated Delivery By</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: ink }}>
            {edd.weekday}, {edd.month}
          </p>
          <p className="mt-0.5 text-[64px] font-extrabold leading-none tracking-tight" style={{ color: ink }}>
            {edd.day}
          </p>
        </div>
      </Card>

      {/* Current status */}
      <Card>
        <Illo>
          <TruckMotif accent={accent} />
        </Illo>
        <div className="relative max-w-[62%]">
          <p className="text-sm text-muted-foreground">Current Status</p>
          <p className="mt-1 text-2xl font-bold leading-tight" style={{ color: ink }}>{orderMock.status}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-background-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {orderMock.statusBadge}
          </span>
        </div>
      </Card>
      </div>

      {/* Latest update — aligns with the right rail (Weather) below */}
      <Card>
        <Illo>
          <PinMotif accent={accent} />
        </Illo>
        <div className="relative max-w-[62%]">
          <p className="text-sm text-muted-foreground">Latest Update</p>
          <p className="mt-1 text-2xl font-bold leading-tight" style={{ color: ink }}>Received At {city}</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {orderMock.latestUpdateTimeLabel}
          </span>
        </div>
      </Card>
    </div>
  );
}
