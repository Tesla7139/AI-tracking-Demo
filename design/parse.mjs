import { readFile, writeFile } from "node:fs/promises";

const toHex = (c) => {
  if (!c) return null;
  const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255);
  const h = (n) => n.toString(16).padStart(2, "0");
  const a = c.a === undefined ? 1 : c.a;
  return "#" + h(r) + h(g) + h(b) + (a < 1 ? h(Math.round(a * 255)) : "");
};
const fillHex = (fills) => {
  if (!Array.isArray(fills)) return null;
  const f = fills.find((x) => x.visible !== false && x.type === "SOLID");
  return f ? toHex(f.color && { ...f.color, a: f.opacity ?? f.color.a }) : null;
};

const lines = [];
let root;
function walk(node, depth, ox, oy) {
  if (!node) return;
  const bb = node.absoluteBoundingBox;
  let x = "", y = "", w = "", h = "";
  if (bb) { x = Math.round(bb.x - ox); y = Math.round(bb.y - oy); w = Math.round(bb.width); h = Math.round(bb.height); }
  const pad = "  ".repeat(depth);
  const parts = [`${pad}[${node.type}] "${node.name}"`];
  if (bb) parts.push(`@(${x},${y}) ${w}x${h}`);
  const bg = fillHex(node.fills) || (node.backgroundColor ? toHex(node.backgroundColor) : null);
  if (bg && (node.type !== "TEXT")) parts.push(`bg=${bg}`);
  if (node.cornerRadius) parts.push(`r=${node.cornerRadius}`);
  if (node.type === "TEXT") {
    const st = node.style || {};
    const color = fillHex(node.fills);
    parts.push(`text=${JSON.stringify((node.characters||"").slice(0,120))}`);
    parts.push(`${st.fontSize || "?"}px/${st.fontWeight || "?"} ${st.fontFamily || ""}`.trim());
    if (color) parts.push(`color=${color}`);
  }
  lines.push(parts.join(" "));
  // recurse (skip very deep vector noise)
  if (node.children && depth < 7 && node.type !== "VECTOR") {
    for (const c of node.children) walk(c, depth + 1, ox, oy);
  }
}

const file = process.argv[2];
const out = process.argv[3];
const json = JSON.parse(await readFile(file, "utf8"));
const nodes = json.nodes;
const key = Object.keys(nodes)[0];
root = nodes[key].document;
const rb = root.absoluteBoundingBox || { x: 0, y: 0 };
lines.push(`FRAME "${root.name}"  ${Math.round(root.absoluteBoundingBox?.width||0)}x${Math.round(root.absoluteBoundingBox?.height||0)}`);
walk(root, 0, rb.x, rb.y);
await writeFile(out, lines.join("\n"));
console.log(out, lines.length, "lines");
