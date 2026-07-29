import { reviews } from "./reviews";

/** Exact review text from the Shopify App Store export (reviews.ts), by store name. */
function reviewText(storeName: string): string | null {
  const r = reviews.find((rv) => rv.name === storeName);
  return r ? r.content.replace(/\s*\n\s*/g, " ").trim() : null;
}

export type CustomerLogo = {
  src?: string;
  name: string;
  reviewer: string;
  role: string;
  review: string | null;
  date?: string;
};

export const customerLogos: CustomerLogo[] = [
  {
    src: "/customers/curlwarehouse.png",
    name: "Curl Warehouse",
    reviewer: "Curl Warehouse Team",
    role: "E-commerce",
    review:
      "This has reduced the number of emails we receive to update orders. It's easy to use and set up, and the developers have been very receptive to changes.",
    date: "Nov 21, 2023",
  },
  {
    src: "/customers/mateina.png",
    name: "Mateina",
    reviewer: "Mateina Team",
    role: "E-commerce",
    review:
      "One of the best order editing apps available that actually works! I've tested about a dozen, and this was by far one of the best. Amazing team and support.",
    date: "Mar 12, 2024",
  },
  {
    src: "/customers/renuebyscience.svg",
    name: "Renue By Science",
    reviewer: "Renue By Science Team",
    role: "E-commerce",
    review:
      "The team at Clickpost are exceptional developers and great people. They listen to feedback and have built genuinely useful tools for Shopify stores.",
    date: "Jan 8, 2024",
  },
  {
    src: "/customers/doonails.svg",
    name: "Doonails",
    reviewer: "Doonails Team",
    role: "E-commerce",
    review: "Really helped us quickly to fix all issues.",
    date: "Feb 3, 2024",
  },
  {
    src: "/customers/modomu.png",
    name: "Modomu",
    reviewer: "Modomu Team",
    role: "E-commerce",
    review:
      "Really happy with Clickpost so far. We added it mainly for order edits but ended up using the upsell part too, which brought in a bit of extra revenue.",
    date: "Apr 5, 2024",
  },
  {
    src: "/customers/hautesauce.png",
    name: "Haute Sauce",
    reviewer: "Haute Sauce Team",
    role: "E-commerce",
    review:
      "Installed Clickpost recently and it works great. Customers can edit their orders and even add extra items, which is a nice bonus.",
    date: "May 17, 2024",
  },
  {
    src: "/customers/westside.png",
    name: "Westside Global",
    reviewer: "Westside Global Team",
    role: "E-commerce",
    review: reviewText("Westside Global"),
    date: "Feb 13, 2026",
  },
  {
    src: "/customers/myborosil.png",
    name: "MyBorosil",
    reviewer: "MyBorosil Team",
    role: "E-commerce",
    review: reviewText("MyBorosil"),
    date: "Oct 14, 2025",
  },
  {
    src: "/customers/wellbeingnutrition.png",
    name: "Wellbeing Nutrition",
    reviewer: "Wellbeing Nutrition Team",
    role: "E-commerce",
    review: reviewText("Wellbeing Nutrition"),
    date: "Sep 17, 2025",
  },
  {
    src: "/customers/marsbyghc.png",
    name: "Mars By GHC",
    reviewer: "Mars By GHC Team",
    role: "E-commerce",
    review: reviewText("Mars By GHC"),
    date: "Jan 8, 2026",
  },
  {
    src: "/customers/vanillapura.png",
    name: "VanillaPura",
    reviewer: "VanillaPura Team",
    role: "E-commerce",
    review: reviewText("VanillaPura"),
    date: "Aug 27, 2025",
  },
  {
    src: "/customers/gharsoaps.png",
    name: "GHAR SOAPS",
    reviewer: "GHAR SOAPS Team",
    role: "E-commerce",
    review: reviewText("GHAR SOAPS"),
    date: "Feb 14, 2026",
  },
];

export type BrandInfo = { tier?: string; country?: string };
export const brandInfo: Record<string, BrandInfo> = {
  Doonails: { tier: "$100M+ brand", country: "Germany" },
  "Curl Warehouse": { tier: "7-figure brand", country: "Canada" },
  VanillaPura: { tier: "7-figure brand", country: "Utah, USA" },
  "GHAR SOAPS": { tier: "8-figure brand", country: "UAE" },
  Mateina: { tier: "Andrew Huberman's favourite", country: "Canada" },
  "Mars By GHC": { tier: "7-figure brand" },
  "Renue By Science": { country: "USA" },
};
