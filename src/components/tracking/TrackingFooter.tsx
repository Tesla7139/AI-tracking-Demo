"use client";

import { Mail, Phone, Clock } from "lucide-react";
import type { Brand } from "@/lib/site";
import { site } from "@/lib/site";
import { useDevice } from "./device";

const POLICY = ["Privacy Policy", "Return & Exchange Policy", "Refund Policy", "Terms & Conditions"];

export function TrackingFooter({ brand }: { brand: Brand }) {
  const mobile = useDevice() === "mobile";
  return (
    <footer className="border-t border-border bg-background-muted">
      <div
        className={`mx-auto grid w-full max-w-[1200px] gap-8 px-6 md:px-8 ${
          mobile ? "grid-cols-2 py-8" : "grid-cols-2 py-12 md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {/* Policy */}
        <div>
          <h3 className="text-eyebrow text-foreground">Policy</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {POLICY.map((p) => (
              <li key={p}>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-eyebrow text-foreground">Contact Us</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> help@{slug(brand.brandName)}.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> +1 (123) 000-0000
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" /> Mon–Fri 6am–9pm, Sat–Sun 9am–12pm
            </li>
          </ul>
        </div>

        {/* Follow */}
        <div>
          <h3 className="text-eyebrow text-foreground">Follow Us</h3>
          <div className="mt-4 flex gap-3.5 text-muted-foreground">
            {SOCIALS.map(({ label, Mark }) => (
              <a key={label} href="#" aria-label={label} className="transition-colors hover:text-foreground">
                <Mark />
              </a>
            ))}
          </div>
        </div>

        {/* Download app */}
        <div>
          <h3 className="text-eyebrow text-foreground">Download Our App</h3>
          <div className="mt-4 flex flex-col gap-2.5">
            {/* Google Play */}
            <a
              href="#"
              className="inline-flex w-fit items-center gap-2.5 rounded-lg border border-border bg-white px-3.5 py-2 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <GooglePlayMark />
              <span className="flex flex-col leading-none text-slate-900">
                <span className="text-[9px] font-medium uppercase tracking-wide">Get it on</span>
                <span className="text-[15px] font-semibold leading-tight">Google Play</span>
              </span>
            </a>
            {/* App Store */}
            <a
              href="#"
              className="inline-flex w-fit items-center gap-2.5 rounded-lg bg-slate-900 px-3.5 py-2 text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <AppleMark />
              <span className="flex flex-col leading-none">
                <span className="text-[9px] font-medium tracking-wide">Download on the</span>
                <span className="text-[15px] font-semibold leading-tight">App Store</span>
              </span>
            </a>
          </div>
        </div>

        {/* Powered by */}
        <div>
          <h3 className="text-eyebrow text-foreground">Powered By</h3>
          <p className="mt-4 text-xl font-extrabold tracking-tight">
            <span className="text-primary">CLICK</span>
            <span className="text-slate-900">POST</span>
          </p>
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © 2026 {brand.brandName} · Powered by {site.name}
      </div>
    </footer>
  );
}

/** Real brand social logos (custom SVGs; lucide dropped brand marks). */
const S = "0 0 24 24";
function Instagram() {
  return (
    <svg width="20" height="20" viewBox={S} fill="currentColor" aria-hidden="true">
      <path d="M12 2c-2.7 0-3 0-4.1.06-1 .05-1.8.24-2.4.5-.7.27-1.2.63-1.8 1.2-.6.6-.9 1.1-1.2 1.8-.26.6-.45 1.3-.5 2.4C2 9.1 2 9.4 2 12s0 3 .06 4.1c.05 1 .24 1.8.5 2.4.27.7.63 1.2 1.2 1.8.6.6 1.1.9 1.8 1.2.6.26 1.3.45 2.4.5C9.1 22 9.4 22 12 22s3 0 4.1-.06c1-.05 1.8-.24 2.4-.5.7-.27 1.2-.63 1.8-1.2.6-.6.9-1.1 1.2-1.8.26-.6.45-1.3.5-2.4.06-1.1.06-1.4.06-4.1s0-3-.06-4.1c-.05-1-.24-1.8-.5-2.4a4.9 4.9 0 00-1.2-1.8 4.9 4.9 0 00-1.8-1.2c-.6-.26-1.3-.45-2.4-.5C15 2 14.7 2 12 2m0 1.8c2.7 0 3 0 4 .06.98.04 1.5.2 1.9.35.47.18.8.4 1.16.76.36.36.58.7.76 1.16.15.4.3.92.35 1.9.05 1.05.06 1.36.06 4s0 2.95-.06 4c-.04.98-.2 1.5-.35 1.9-.18.47-.4.8-.76 1.16-.36.36-.7.58-1.16.76-.4.15-.92.3-1.9.35-1.05.05-1.36.06-4 .06s-2.95 0-4-.06c-.98-.04-1.5-.2-1.9-.35a3.1 3.1 0 01-1.16-.76 3.1 3.1 0 01-.76-1.16c-.15-.4-.3-.92-.35-1.9C3.8 15 3.8 14.6 3.8 12s0-2.95.06-4c.04-.98.2-1.5.35-1.9.18-.47.4-.8.76-1.16.36-.36.7-.58 1.16-.76.4-.15.92-.3 1.9-.35 1.05-.05 1.36-.06 4-.06M12 7.1a4.9 4.9 0 100 9.8 4.9 4.9 0 000-9.8m0 8.06a3.16 3.16 0 110-6.32 3.16 3.16 0 010 6.32m6.25-8.26a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0" />
    </svg>
  );
}
function XMark() {
  return (
    <svg width="18" height="18" viewBox={S} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.8L1.5 2h6.8l4.7 6.2zm-1.2 18h1.8L7.3 3.9H5.4z" />
    </svg>
  );
}
function Facebook() {
  return (
    <svg width="20" height="20" viewBox={S} fill="currentColor" aria-hidden="true">
      <path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.23 2.6.23v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0024 12" />
    </svg>
  );
}
function YouTube() {
  return (
    <svg width="22" height="22" viewBox={S} fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.5a3 3 0 00-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 00.5 6.5 31 31 0 000 12a31 31 0 00.5 5.5 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.5M9.6 15.6V8.4l6.3 3.6z" />
    </svg>
  );
}
function LinkedIn() {
  return (
    <svg width="20" height="20" viewBox={S} fill="currentColor" aria-hidden="true">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2M8 19H5V9h3zM6.5 7.7a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5M19 19h-3v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6V19h-3V9h2.9v1.4h.04c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7z" />
    </svg>
  );
}

export const SOCIALS = [
  { label: "Instagram", Mark: Instagram },
  { label: "X", Mark: XMark },
  { label: "Facebook", Mark: Facebook },
  { label: "YouTube", Mark: YouTube },
  { label: "LinkedIn", Mark: LinkedIn },
];

/** Apple's bitten-apple logo (white). */
function AppleMark() {
  return (
    <svg width="20" height="24" viewBox="0 0 384 512" fill="#fff" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM255.4 82.6c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/** Google Play's four-color play triangle. */
function GooglePlayMark() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
      <path fill="#00D2FF" d="M.6 1.1C.3 1.4.1 1.9.1 2.6v16.8c0 .7.2 1.2.5 1.5l9.1-9.4z" />
      <path fill="#00F076" d="M.6 1.1 13 8.2 9.7 11.5z" />
      <path fill="#F73448" d="M13 8.2l4.4 2.5c.7.4.7 1.6 0 2L13 15.3l-3.3-3.8z" />
      <path fill="#FFCA00" d="M.6 20.9 13 15.3 9.7 11.5z" />
    </svg>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
