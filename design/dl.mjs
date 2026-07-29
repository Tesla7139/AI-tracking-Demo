import { writeFile } from "node:fs/promises";
const map = {
  "frame1-19375-2468.png": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/518c4ad9-209e-498f-a7f1-3d560f3e89fc",
  "frame2-19313-550.png": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0fcf107d-38bb-452d-ae19-b0264883bc2e",
  "frame3-19379-3167.png": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/98a1dd79-cb02-4b99-ad22-9fee06f780ad",
  "frame4-19401-3725.png": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e2b0a2b9-2cd5-498c-b474-4794cff91d7a",
};
for (const [name, url] of Object.entries(map)) {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 30000);
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(`design/${name}`, buf);
    console.log(name, res.status, buf.length, "bytes");
  } catch (e) {
    console.log(name, "ERR", e.message);
  }
}
