# AI Order Tracking — decoded design spec

Source: Figma "2.0 R&E & AI Tracking (US Customer)". 4 frames = **same page, 4 brands**
(thirdlove, newtonbaby, armanibeauty, pehr). Raw per-frame outlines: `outline-frame{1..4}.txt`.

## Canvas
- Fixed **1280px** wide desktop, ~2999px tall. Page bg `#fafafa`.
- Content grid: left main column (x=128, 675px wide) + right rail (x=827, 325px wide). 24px gaps.
- Cards: white, radius 16, subtle shadow. Right-rail info cards use translucent white `#ffffff80`.
- Brand accent drives the theme (newtonbaby green `#00b189` / timeline `#1fb189`). Per-brand color.
- Fonts in Figma: Helvetica (body), some Open Sans / Montserrat. We render with Inter — acceptable.

## Header (0,0 · 1280×130)
- **Sale ribbon** (50px, brand color): message + `FLASH` pill + countdown `HH:MM:SS` + "Shop Now" + close.
- **Logo banner** (80px, white): centered brand logo.

## Top status row (y=154 · three 325×167 white cards)
1. **EDD** — "Estimated Delivery By" / "Sat, July" / big day number "25" (70px) + spring animation.
2. **Status** — "Current Status" / "On The Way" (24px) + "Running Timely" pill + truck animation.
3. **Latest update** — "Latest Update" / "Received At New York" + timestamp pill "Thu 24 July, 8 PM".

## Left column
- **Shipment Journey** (675×504) — vertical timeline, green progress line. Rows: Order Placed,
  Dispatched, **In Transit** (active, expanded w/ details rows + "Close Detailed Journey"),
  Out For Delivery, Delivered. Each: colored dot + status + "City, Day Date, Time".
- **Order Item(s)** (675×737) — per item: "Item n/2" pill, product row w/ image, then 3 tip cards:
  - **Style tip** (green `#00a86212`) "Pro Tip: …"
  - **Care tip** (blue `#f2fbfe`) "Care Tip: …"
  - **Usage tip** (orange `#fff6ed`) "Usage Tip: …"
- Full-width **AI hero image** (1024×521).
- **Explore Our New Arrivals** (1024×433) — horizontal product cards (image 214², name, price) + arrow.

## Right rail (personalized)
- **Weather widget** (325×264) — "Weather at {city}" + temp (e.g. "2°C") + condition ("Cloudy") +
  "Today at {time}" + Humidity % + Wind mph + weather animation.  ← **fed by /api/weather**
- **{City} Fun Fact** (325×214) — title + description + pagination dots.  ← location-derived
- **Did You Know?** (325×206) — brand story + pagination dots.  ← brand-derived
- **Order Details** (325×305) — Order id / Tracking id / Carrier (Fedex) / Order type (Prepaid) /
  Order date / Order Value ($340), each with copy icon.
- AI image (325×185).

## Footer (#e9ebed · 1280×347)
Columns: Policy (Privacy, **Return & Exchange**, Refund, Terms) · Contact Us (email/phone/hours) ·
Follow Us (socials) · Download Our App (Play + App Store) · Powered By (Clickpost).

## Personalization mapping (our foundation → design)
- Brand name/logo/accent  → `/api/brand`  (header logo, ribbon color, theme accent, Did You Know)
- City ("New York")       → `/api/geo`    (weather title, "Received At", Fun Fact)
- Temp/condition/etc.     → `/api/weather` (weather widget)
- Everything else (journey, items, tips, order details, products) = crafted mock for the demo.
