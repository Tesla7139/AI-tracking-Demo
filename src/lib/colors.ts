/** Darken a hex color by mixing toward black. amt 0–1 (0.45 = 45% darker). */
export function darken(hex: string, amt = 0.45): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return hex;
  const d = (x: number) => Math.round(x * (1 - amt));
  const hx = (x: number) => d(x).toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}
