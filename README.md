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
- **Ticket notches** (Act IV) use `mask-composite`; browsers without it
  show square corners at the tear line, nothing breaks.
