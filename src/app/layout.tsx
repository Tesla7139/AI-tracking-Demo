import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

// Geometric, slightly-rounded display font used for the brand-name wordmark.
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-logo",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Clickpost · AI Order Tracking",
    template: "%s · Clickpost",
  },
  description:
    "A branded, personalized post-purchase order-tracking experience for any store using Clickpost.",
  robots: { index: false, follow: false },
};

// Ensure phones report their real device width so the mobile layout is used
// (a missing viewport makes a phone render at ~980px = the desktop layout).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${poppins.variable}`}>
      <body className="relative flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <main id="main" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
