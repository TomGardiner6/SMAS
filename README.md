# Save Me A Seat — concept site

A single-page interactive concept site for **Save Me A Seat (SMAS)**: an
upcoming app for women in London who need company at short notice. Drop a
pin in a public place; a verified woman nearby says "on my way"; safety
features run underneath everything.

The design brief lives at [docs/smas-site-brief.md](docs/smas-site-brief.md)
and is the single source of truth — read it in full before changing
anything.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS 4 (all colours/type from
  CSS custom properties in `app/globals.css`)
- Mapbox GL JS — one shared map instance, restyled at runtime to the
  palette, driven by scroll between five London waypoints
- Framer Motion for the pin-drop choreography and reveals
- Supabase for the waitlist

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_MAPBOX_TOKEN` — [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` —
     Supabase dashboard → Project Settings → API
3. Apply the waitlist schema: open the Supabase dashboard → SQL Editor,
   paste the contents of [supabase/schema.sql](supabase/schema.sql), Run.
   (RLS is insert-only for anonymous visitors; nobody can read the list
   from the browser.)
4. `npm run dev` → [http://localhost:3000](http://localhost:3000)

Without a Mapbox token the site still works: it falls back to a static
styled image of London (`public/map-fallback.jpg`) rather than a broken
grey box.

## Deploy (Vercel)

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
   (free Hobby tier is fine).
2. Add the three environment variables in Project Settings → Environment
   Variables.
3. Every push to `main` deploys automatically.

> **Set the env vars before you build, and redeploy after adding them.**
> `NEXT_PUBLIC_*` variables are inlined into the client bundle at **build
> time**, not read at runtime. If you add or change them on an
> already-built deployment, nothing happens until you trigger a fresh
> deploy (Deployments → ⋯ → Redeploy). A deployment built without the
> Mapbox token falls back to the static map image (no pin-drop), and one
> built without the Supabase keys shows the "that didn't save" error on
> every signup — both silently, with no console error.

## Design decisions & deviations

- **Map restyle at runtime** (brief §5.1): `lib/map-theatre.ts` repaints
  `mapbox/light-v11` layer-by-layer, pattern-matching layer ids so a minor
  style-version bump degrades gracefully instead of throwing. No Studio
  style needed; the repo works with any token.
- **Hero camera centre** sits a little west of the brief's Soho Square
  waypoint so the pin-drop demo plays clear of the headline on the left
  third. The pin itself still drops by Soho Square.
- **Mapbox css vs Tailwind**: mapbox-gl's own stylesheet forces
  `position: relative` on the map container, which beats Tailwind's
  `absolute` at equal specificity. The container is therefore sized
  (`h-full w-full`) rather than positioned — don't "simplify" it back.
- **Act II on mobile** is a tap-through card (Next button) driving the
  same map events; scroll is never hijacked (brief §3.4).
- **The hero "try it" demo** (`TryPinDemo`) merges the reasons showcase
  with the interactive pin-drop: the chips *are* the menu of use cases,
  and tapping one drops the pin. No map taps anywhere, so it can't fight
  page scroll on mobile; the map stays `interactive: false` (§5.2). Once
  the visitor drops her own pin, the scripted hero loop stands down.
- **Scene staging is viewport-derived** (`lib/hero-scene.ts`): pin and
  walk positions are unprojected from screen coordinates, because fixed
  Soho lng/lat put the whole cast off the right edge on phones. Staging
  waits for the camera to be idle first.
- **Chips fly to real venues** (`lib/reasons.ts`): each reason has a real
  London spot — Centre Court for tennis, the British Library for study,
  Padella at Borough Market for dinner, Colbert on Sloane Square for
  French. The flight aims the venue at the exact viewport point the pin
  drops on (`placeOffset`), and the scene holds its curtain until the
  camera has actually arrived there — if scrolling interrupts the flight,
  the pin waits for the hero's next return trip rather than dropping at
  the wrong venue. The sequence ends with a slow zoom-out around the pin,
  and scrolling back to the hero returns to *your* venue, not Soho.
- **The hero vocab re-deals per chip** (`components/HeroVocab.tsx`): the
  eyebrow's "— London" becomes the venue's neighbourhood, and the French
  chip swaps the eyebrow and headline into French ("Posé un lapin ?"),
  word by word on a stagger. The mount-time line renders static so server
  and client markup stay identical (the same SSR-parity rule that bit
  `Reveal` under reduced motion); reduced motion swaps instantly.
- **Share-card image needs `metadataBase`** (`app/layout.tsx`): the OG and
  Twitter images are given as `/og.png`, a root-relative path. Next only
  turns that into an absolute URL if `metadataBase` is set — otherwise it
  falls back to `http://localhost:3000/og.png`, which is dead everywhere
  the link is actually shared. It's pinned to the Vercel domain; update it
  if the site moves to a custom domain.
- **Mobile reply lands under the thumb** (`TryPinDemo`): on a phone the
  pin drops in the strip above the headline, but your eyes are on the
  chips at the bottom — so the caption beneath the chips swaps from the
  venue name to her reply exactly when the bubble pops up top. It's a
  single line that swaps content (never a second line) so it can't push
  itself below the fold. The hero's mobile spacing and smallest-breakpoint
  headline size were trimmed so that caption clears the fold while the pin
  scene still clears the eyebrow.
- **Waitlist name column**: if the deployed code sends `name` before the
  column exists in Supabase, the form retries the insert without it
  (PGRST204), so a schema/deploy ordering mistake can't break signups.
- **Ticket notches** (Act IV) use `mask-composite`; browsers without it
  show square corners at the tear line, nothing breaks.
