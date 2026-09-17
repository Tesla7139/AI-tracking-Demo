import assert from "node:assert/strict";
import { test } from "node:test";
import { buildNewArrivals, buildOrderItems, getPaidProducts } from "../src/lib/tracking.ts";

const product = (id, price, title = id) => ({
  id, title, price, variant: "", qty: 1, image: `https://example.com/${id}.jpg`,
});

const kegg = [
  product("shipping", 20, "Return Shipping"),
  product("test", 75, "At-home Male Fertility Sperm Test Kit"),
  product("course", 0, "30-Day Conception Success Program"),
  product("guarantee", 0, "6-month Pregnancy Guarantee"),
  product("cradle", 15, "kegg Charging Cradle"),
  product("tracker", 279, "kegg fertility tracker"),
];

test("kegg keeps only three paid physical products, never return shipping", () => {
  const items = buildOrderItems(kegg);
  assert.deepEqual(getPaidProducts(kegg).map((p) => p.title), [kegg[1].title, kegg[4].title, kegg[5].title]);
  assert.deepEqual(items.map((p) => p.name), [kegg[1].title, kegg[4].title]);
  assert.deepEqual(items.map((p) => p.rec.name), [kegg[5].title, kegg[1].title]);
  const arrivals = buildNewArrivals(kegg);
  assert.deepEqual(arrivals.map((p) => p.name), [kegg[5].title, kegg[1].title, kegg[4].title]);
  assert.deepEqual(arrivals.map((p) => p.price), [279, 75, 15]);
  assert.equal(new Set(arrivals.map((p) => p.name)).size, arrivals.length);
});

test("shipping fee and label entries are excluded without hiding shipping merchandise", () => {
  const fees = ["Return Shipping", " return SHIPPING ", "Return Shipping Fee", "Shipping", "Shipping Charge", "Shipping Cost", "Shipping Label", "Return Postage", "Return Label"];
  const merchandise = ["Shipping Box", "Return Shipping Kit", "Shipping Label Printer", "Return to Nature Tee"];
  const products = [...fees, ...merchandise].map((title, i) => product(String(i), 20, title));
  assert.deepEqual(getPaidProducts(products).map((p) => p.title), merchandise);
});

test("shipping-only catalogues do not fall back to sample merchandise", () => {
  const products = [product("shipping", 20, "Return Shipping")];
  assert.deepEqual(buildOrderItems(products), []);
  assert.deepEqual(buildNewArrivals(products), []);
});

test("AI cannot bring a shipping fee back as a recommendation", () => {
  const [item] = buildOrderItems(kegg, [{ forItem: kegg[1].title, name: "Return Shipping", blurb: "Wrong" }]);
  assert.deepEqual(item.rec, buildOrderItems(kegg)[0].rec);
});

test("filters free entries before choosing orders and arrivals", () => {
  const products = [product("free", 0), product("a", 2), product("b", 3), product("c", 4)];
  assert.deepEqual(buildOrderItems(products).map((p) => p.name), ["a", "b"]);
  assert.deepEqual(buildNewArrivals(products).map((p) => p.name), ["c", "a", "b"]);
});

test("nonpositive and nonfinite prices never become demo products", () => {
  const products = [0, -1, NaN, Infinity, -Infinity, 0.25].map((price, i) => product(String(i), price));
  assert.deepEqual(getPaidProducts(products).map((p) => p.price), [0.25]);
  assert.deepEqual(buildOrderItems(products).map((p) => p.price), [0.25]);
  assert.deepEqual(buildNewArrivals(products).map((p) => p.price), [0.25]);
});

test("an all-free catalogue does not turn into sample sales items", () => {
  const products = [product("free", 0), product("unknown", NaN)];
  assert.deepEqual(buildOrderItems(products), []);
  assert.deepEqual(buildNewArrivals(products), []);
});

test("one paid product has no self upsell", () => {
  const products = [product("a", 20), product("free", 0)];
  assert.equal(buildOrderItems(products)[0].rec, null);
});

test("genuinely missing catalogues keep the existing positive-price samples", () => {
  assert.ok(buildOrderItems([]).length > 0);
  assert.ok(buildOrderItems([]).every((p) => p.price > 0));
  assert.ok(buildNewArrivals([]).length > 0);
  assert.ok(buildNewArrivals([]).every((p) => p.price > 0));
});

test("valid AI picks use the matching product image and blurb", () => {
  const products = [product("a", 10), product("b", 20), product("c", 30), product("d", 40)];
  const [item] = buildOrderItems(products, [{ forItem: "a", name: "d", blurb: "Pairs well" }]);
  assert.deepEqual(item.rec, { name: "d", image: products[3].image, blurb: "Pairs well" });
});

test("free, unknown, self and stale AI picks cannot replace a safe pairing", () => {
  const products = [product("a", 10), product("b", 20), product("c", 30), product("free", 0)];
  for (const name of ["free", "unknown", "a"]) {
    assert.deepEqual(
      buildOrderItems(products, [{ forItem: "a", name, blurb: "Wrong" }])[0].rec,
      buildOrderItems(products)[0].rec,
    );
  }
  assert.deepEqual(
    buildOrderItems(products, [{ forItem: "old-store-item", name: "b", blurb: "Wrong" }]),
    buildOrderItems(products),
  );
});

test("ambiguous AI titles are rejected even when one match is paid", () => {
  const products = [product("a", 10), product("b", 20), product("c", 30), product("d", 40, "duplicate"), product("gift", 0, "duplicate")];
  assert.deepEqual(
    buildOrderItems(products, [{ forItem: "a", name: "duplicate", blurb: "Wrong" }])[0].rec,
    buildOrderItems(products)[0].rec,
  );
});

test("AI cannot create a pairing when only the ordered product is paid", () => {
  const products = [product("a", 10), product("free", 0)];
  for (const name of ["a", "free", "unknown"]) {
    assert.equal(buildOrderItems(products, [{ forItem: "a", name, blurb: "Wrong" }])[0].rec, null);
  }
});

test("paid prices remain unchanged and builders do not mutate source data", () => {
  const products = [product("a", 1.25), product("b", 2.75), product("c", 9.99), product("free", 0)];
  const original = structuredClone(products);
  assert.deepEqual(buildOrderItems(products).map((p) => p.price), [1.25, 2.75]);
  assert.equal(buildNewArrivals(products)[0].price, 9.99);
  assert.deepEqual(products, original);
});

test("arrival count limit applies after filtering free entries", () => {
  const products = [product("a", 1), product("b", 2), ...Array.from({ length: 20 }, (_, i) => product(`p${i}`, i % 2 ? 5 : 0))];
  const arrivals = buildNewArrivals(products);
  assert.equal(arrivals.length, 10);
  assert.ok(arrivals.every((p) => p.price > 0));
});
