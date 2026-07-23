# SMAS — Save Me A Seat: Concept Website Brief

**Read this whole document before writing any code.** It is the single source of truth for this build. Where it makes a choice, follow it. Where it leaves a choice open, it says so explicitly and gives you the criteria to decide.

---

## 1. What this is

A single-page interactive concept site for **Save Me A Seat (SMAS)** — an upcoming app for women in London who need company at short notice: stood up on a date, holding a spare ticket, or just wanting someone to share an hour with. Users drop a pin in a public place; nearby verified women see it and reply "On my way!"; a private chat opens; safety features (panic button, fake call, check-in nudges) run underneath everything.

**The site's single job:** make a visitor *feel* the product in 60 seconds — see a pin drop on a real London map, watch someone respond, understand the safety layer — and leave their email on the waitlist.

**Audience:** women in London, 18–40. The site must feel warm, safe, and credible — like a well-designed independent product with a point of view, not a startup template and absolutely not "AI-generated landing page."

**The bar:** this site is a gift as much as a product. It should feel like a small design studio spent two weeks on it. Every default you'd normally reach for, question it.

## 2. Stack

- **Next.js 14+ (App Router) + TypeScript**, deployed to **Vercel** (free Hobby tier)
- **Tailwind CSS** — but all colours/type/spacing come from CSS custom properties defined by this brief (tokens in `globals.css`, referenced via Tailwind config). No Tailwind default palette colours anywhere.
- **Framer Motion** for scroll-driven and orchestrated animation
- **Mapbox GL JS** for the live map (token via `NEXT_PUBLIC_MAPBOX_TOKEN` env var — assume it exists; add `.env.example`)
- **Supabase** for the waitlist (env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Fonts self-hosted via `next/font` (Google Fonts sources)

Single page (`/`) plus a minimal `/privacy` stub. No CMS, no auth, no other routes.

## 3. Design direction — "The Theatre"

The name is *Save Me A Seat*. The visual world is drawn from the place that phrase comes from: **theatre seats, house lights, interval bars, a programme in your hand, London at dusk**. Warm and editorial, but grounded in this specific product — never generic cosy-startup.

### 3.1 Palette (exact tokens — do not substitute)

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FBF6EE` | Page background — warm programme-paper ivory |
| `--ink` | `#2E2128` | Primary text — espresso-aubergine, never pure black |
| `--velvet` | `#8C2F3F` | Primary accent — theatre-seat garnet. Pins, CTAs, links |
| `--houselight` | `#E4A75C` | Secondary accent — amber glow. Highlights, "chatty" vibe, hover states |
| `--sage` | `#8A9B84` | Calm accent — "low-key" vibe, safety/verified states |
| `--blush` | `#EFDFD7` | Soft fill — cards, section tints, map water |

Rules: `--velvet` is the hero accent and appears sparingly enough to stay special. Never introduce purple, teal, or blue gradients. Never use terracotta/coral (`#D97757`-adjacent) — it's the signature colour of generated sites and this must not read as one. Shadows are warm (`--ink` at low opacity), never grey-blue.

### 3.2 Typography

- **Display: Fraunces** (variable). Use its optical size and softness — large headlines at weight 500–600 with slight negative tracking, `wonk` and `SOFT` axes on for warmth at display sizes. Headlines are the personality of the page; set them big and confident.
- **Body: Newsreader** at 17–19px, generous line-height (1.65). Editorial, readable, human.
- **UI/labels: Archivo** — uppercase eyebrows, buttons, map UI, small caps labels with wide tracking (0.08em+).

Type scale: roughly 1.25 ratio. Hero headline should hit ~clamp(2.75rem, 7vw, 5.5rem). Eyebrows above every section headline (Archivo, uppercase, `--velvet`), styled like acts in a programme — but **only** if labelled as content that genuinely is sequential (see §4). No decorative numbering otherwise.

### 3.3 The signature element

**The pin-drop is the site's one unforgettable thing.** A garnet teardrop pin that falls with weight (slight overshoot + settle), lands on the real map, and emits one soft expanding ripple ring. It appears in the hero demo, recurs as a scroll motif (section markers are tiny pins), and the favicon is the pin. Spend your animation polish budget here. Everything else stays quieter than this.

### 3.4 Motion philosophy

Rich but orchestrated — one continuous narrative, not scattered effects.

- **The map is the spine of the page.** As the visitor scrolls, the Mapbox camera glides between London locations (see §5), so scrolling the page = travelling across London. Use `flyTo`/`easeTo` triggered by scroll progress (Framer Motion `useScroll` + section thresholds), not per-pixel scrubbing (which fights Mapbox's renderer and feels janky).
- Text/cards enter with soft fade+rise (12–20px, 0.5–0.7s, custom ease like `[0.22, 1, 0.36, 1]`). Stagger children.
- Micro-interactions: buttons compress slightly on press; the waitlist input underline draws in `--velvet` on focus.
- **`prefers-reduced-motion`: everything works with no animation** — map jumps cut instantly, pins render pre-landed, no parallax. This is a hard requirement, not a nice-to-have.
- On mobile, never hijack scroll. The map demo becomes a tap-through sequence (a "Next" affordance advances the story) rather than scroll-linked.

## 4. Page structure

One page, five movements. Eyebrow labels may use "Act I / Act II / …" **because the page genuinely is a sequence** — a story of one evening. Keep that conceit light; it appears in the eyebrows only.

### Hero — "The pin drop" (Act I)
Full-viewport. The real Mapbox map fills the background (Soho, ~zoom 14.5, slight pitch ~40° for depth), custom-tinted to the palette (§5.1). Over it, on the left third:

- Eyebrow: `SAVE ME A SEAT — LONDON`
- Headline (Fraunces): **"Stood up? Spare ticket? Someone nearby will take that seat."**
- One supporting sentence + a `--velvet` CTA button: **"Join the waitlist"** (smooth-scrolls to the final section).

Three seconds after load (skip under reduced motion): the scripted demo begins — a garnet pin drops near Soho Square, ripples; ~1.5s later a small avatar dot slides in from two streets away; a chat bubble pops above it: **"On my way! 🚶‍♀️ 4 min"**; the pin gains a subtle `--houselight` glow ("seat saved"). The sequence loops gently every ~20s. This is the whole product in eight seconds, before a single word of explanation.

### How it works (Act II)
Map glides east to Covent Garden. Three steps presented as a vertical scroll sequence, each step syncing a map event:
1. **Drop a pin** — public places only; choose your vibe. Show the three pin colours with their meanings: `--houselight` chatty, `--sage` low-key company, `--velvet` spare ticket.
2. **Someone says "on my way"** — verified women nearby see your pin; you confirm who joins you.
3. **Company, on your terms** — in-app chat, and the pin closes when you're happy.

Copy is short, warm, active voice. No feature-grid of six icon cards — this is a story, not a spec sheet.

### Safety (Act III)
The emotional core — give it room. Map settles on the South Bank at dusk (if using a custom style with lighting, warm it here; otherwise tint shift toward dusk via overlay).

- Headline direction: **"Built so your gut can relax."**
- Four safety facts, presented as a slow-revealing editorial list (not icon cards): every member ID-verified before her first pin · pins only in public places · one-tap alert to your chosen contacts, or a fake incoming call · a gentle check-in nudge mid-meetup.
- A quiet line about ratings: private, positive-only tags — kindness gets a small medal, never a public score.
- Include "women-only, London-first" plainly here; it's a feature, not a footnote.

### The interval bar (Act IV) — spare tickets
Map glides to the Royal Albert Hall. Short section: the spare-ticket use case ("Her plus-one cancelled. Your favourite band. Everyone wins."). One example ticket-pin card rendered like a small theatre ticket (perforated edge, Archivo details). This plants the future marketplace without selling anything.

### Waitlist (Act V — "Take your seat")
Map pulls back to a wide, slow-drifting view of the whole of central London with a scatter of dim pins glowing on. Centered card on `--paper`:

- Headline: **"Save your seat."**
- Email input + button **"Join the waitlist"**. Optional London-postcode-area field (nice for launch planning, clearly optional).
- Success state replaces the form: **"Seat saved. We'll write when the house lights go up in London."** with a small settled pin animation.
- Error states say what happened and what to do ("That email doesn't look right — check for typos"), never apologise vaguely.
- Footer: tiny — © line, contact mailto, `/privacy` link, "Made in London" with a small pin glyph.

## 5. The map — implementation spec

### 5.1 Custom styling
Use `mapbox://styles/mapbox/light-v11` as the base, then **restyle at runtime** with `map.setPaintProperty` on load so the map belongs to the palette: background/land toward `--paper`, water `--blush`, roads warm ivory-on-oat with `--ink` at low opacity for major roads, parks a desaturated `--sage` tint, all labels `--ink` at reduced opacity, POI icons hidden. The map must look like it was printed in the programme, not embedded from Google. (If runtime restyling of a layer proves unreliable, an alternative is acceptable: define the style JSON adjustments in code, or document in the README how to create a Studio style — but attempt runtime styling first so the repo works with any token.)

### 5.2 Behaviour
- `interactive: false` for the ambient/scroll experience (no accidental scroll-zoom traps); pointer events pass through to page scroll. Consider a small "explore the map" toggle in the hero that enables interaction — optional, only if it doesn't complicate the scroll choreography.
- Pins are custom DOM markers (styled divs/SVG, animated with Framer Motion), not default Mapbox markers.
- Lazy-init the map (`IntersectionObserver` or dynamic import, `ssr: false`); show a `--blush` placeholder with a subtle grain until ready so LCP isn't blocked. Reuse **one** map instance across sections — never mount multiple maps.
- Camera waypoints (approx): Soho Square `-0.1320, 51.5152` → Covent Garden `-0.1229, 51.5117` → South Bank `-0.1160, 51.5066` → Royal Albert Hall `-0.1774, 51.5009` → wide London `-0.1278, 51.5074`, zoom ~11.5.
- Handle `webglcontextlost` and missing-token cases gracefully: fall back to a static styled image of London (include one in `/public`) so the site never shows a broken grey box.

## 6. Waitlist — Supabase

Table `waitlist_signups`: `id uuid pk default gen_random_uuid()`, `email text not null`, `postcode_area text`, `created_at timestamptz default now()`. Include the SQL in `supabase/schema.sql` with:
- RLS enabled; a policy allowing **insert only** for the `anon` role; no select/update/delete for anon.
- A unique index on `lower(email)`; on conflict, still show the success state (don't leak whether an email already exists).

Client-side: validate email format, honeypot field for bots, disable button while submitting. No third-party analytics.

## 7. Anti-goals — the "generated site" tells to avoid

Do **none** of the following: emoji-icon feature grids · three-column card layouts with identical icons · purple/blue gradient blobs or mesh gradients · glassmorphism · stock illustrations of people · "Lorem ipsum" anywhere · testimonial placeholders · fake press logos · cookie banners (no tracking = none needed) · dark-mode toggle (one designed mode, done well) · generic copy like "Connect with like-minded people" or "Your safety is our priority" (show the safety features instead of claiming the value) · em-dash-heavy hype copy. If a section starts to look like it could belong to any SaaS template, redesign it around this product's world (seats, tickets, the map, the evening).

## 8. Copy voice

Warm, direct, a little wry; British English throughout. Short sentences. Active voice. Talk to "you", the woman using it — never about "users". Safety copy is confident and specific, never fearful or preachy. Buttons say exactly what they do. The one-liner test: every sentence should be plausible from a thoughtful friend, not a brand.

## 9. Quality floor

- Fully responsive down to 360px; the mobile map story is tap-through (§3.4), text remains readable over the map via a soft `--paper` scrim.
- Keyboard: visible focus rings (`--velvet` outline), form fully operable, skip-to-waitlist link.
- Semantic HTML, alt text, colour contrast ≥ 4.5:1 for body text (check `--ink` on `--blush`).
- Performance: fonts subset via `next/font`, map lazy-loaded, no layout shift on font/map load. Target Lighthouse ≥ 90 performance on mobile.
- OG/Twitter meta with a designed 1200×630 OG image (paper background, pin, "Save Me A Seat — London"). Favicon = the pin.
- `README.md`: setup steps, env vars, how to run, how to deploy to Vercel, how to apply the Supabase schema.

## 10. Build order

1. Scaffold: Next.js + Tailwind + tokens + fonts. Get the type and palette rendering on a static hero first — judge it in the browser before adding anything.
2. Map: init, runtime restyle, one camera waypoint, the scripted hero pin-drop.
3. Scroll choreography: sections driving camera waypoints; reduced-motion and mobile tap-through paths.
4. Content: all five acts with real copy per §4 and §8.
5. Waitlist: Supabase schema + form + states.
6. Polish pass: micro-interactions, OG image, favicon, Lighthouse, then a self-critique pass — screenshot each section and ask "would this pass as a design studio's work?" Fix what wouldn't.

## 11. Working notes for you (the coding agent)

- After each visual milestone, review a screenshot before moving on. Chanel rule: at the end, remove one decoration.
- Commit in small, well-messaged steps matching the build order — this repo will have a human collaborator reading the history.
- If you must deviate from this brief (library constraint, Mapbox limitation), note the deviation and reasoning in the README under "Design decisions."
