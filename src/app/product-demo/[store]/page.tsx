import { HomeClient } from "@/components/home/HomeClient";

/**
 * Deep-link alias matching the order-editing demo's URL shape:
 * /product-demo/<store> (e.g. /product-demo/gullylabs.com) opens the demo straight
 * into that store. Mirrors the top-level /[store] route.
 */
export default async function ProductDemoStorePage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store } = await params;
  return <HomeClient initialStore={decodeURIComponent(store)} />;
}
