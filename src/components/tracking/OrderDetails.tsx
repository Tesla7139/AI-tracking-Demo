"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { orderDetails } from "@/lib/tracking";
import { TrackingCard } from "./TrackingCard";

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium text-foreground">
        {value}
        {copyable && (
          <button onClick={copy} aria-label={`Copy ${label}`} className="text-muted-foreground transition-colors hover:text-foreground">
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          </button>
        )}
      </span>
    </div>
  );
}

export function OrderDetails({ orderValue, embedded = false }: { orderValue?: string; embedded?: boolean }) {
  const rows = (
    <div className={`${embedded ? "" : "mt-2"} divide-y divide-border/60`}>
      <Row label="Order id" value={orderDetails.orderId} copyable />
      <Row label="Tracking id" value={orderDetails.trackingId} copyable />
      <Row label="Carrier partner" value={orderDetails.carrier} />
      <Row label="Order type" value={orderDetails.orderType} />
      <Row label="Order date" value={orderDetails.orderDate} />
      <Row label="Order value" value={orderValue ?? orderDetails.orderValue} />
    </div>
  );

  if (embedded) return rows;

  return <TrackingCard title="Order Details">{rows}</TrackingCard>;
}
