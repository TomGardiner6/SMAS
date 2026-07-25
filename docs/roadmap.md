# SMAS — next iteration plan

Working handover for the rounds of changes after the initial build. The
site is live and functioning on Vercel. Read
[smas-site-brief.md](smas-site-brief.md) for the design bible; this file is
just the delta.

## Done

- Removed the "Made in London" footer badge (it isn't true).
- De-duplicated the waitlist copy: intro now "…first through the doors";
  success now "You're on the list — we'll write the moment we open in
  London."
- **Name field on the waitlist** (optional, personalises the success line:
  "Seat saved, Maya."). The client is sequencing-safe: if the `name`
  column doesn't exist yet, it retries the insert without it. **Still to
  do in Supabase: re-run `supabase/schema.sql` in the SQL editor** (the
  whole file is idempotent) so names actually get stored.
- **Interactive demo + reasons showcase, merged**: the hero now asks
  "Try it — who's the seat for?" with four chips (tennis partner,
  study buddy, new face for dinner, native French speaker). The chips
  double as the use-case showcase; tapping one drops the pin and the
  reply answers the reason ("Save me a seat 🍷 4 min"). This is the
  roadmap's old §2 option B and §3 options A+B in one mechanism — no map
  taps, scroll-safe on mobile, reduced-motion renders pre-landed.
- **Scene staging is viewport-derived** (`lib/hero-scene.ts`) — fixes the
  scripted hero demo being entirely off-screen on phones.
- **Chips fly to real venues** (`lib/reasons.ts`): tennis → Centre Court,
  Wimbledon; study → the British Library; dinner → Padella, Borough
  Market; French → Colbert, Sloane Square. The camera flight aims the
  venue under the pin point (`placeOffset`), the pin waits for arrival
  before dropping, a caption under the chips names the spot, and the
  scene ends with a slow pull-back around the pin. Scrolling back to the
  hero returns to your venue.
- **Hero vocab re-deals per chip** (`components/HeroVocab.tsx`): eyebrow
  "— London" becomes the venue's neighbourhood; the French chip swaps the
  whole top vocab into French on a word stagger.
- **Reduced-motion bug fix**: `Reveal` used to SSR the hidden style and
  then render a plain div on reduced-motion clients; React kept the
  `opacity:0`, hiding Acts II–V. Reveals are now an instant cut instead.

- **Laptop + phone audit pass** (2026-07-25). Walked all five acts at
  1440x900, 1280x720, iPhone 13 and iPhone SE. Fixed: the try-it chips
  falling below the fold on any viewport under ~830px tall; map labels
  ghosting through the `bg-paper/95` cards on mobile; Acts III and IV
  having nothing on the map at all (Act IV now pins the Royal Albert
  Hall); Act II's vibe pins hiding behind the cards on mobile; and the
  waitlist scatter sitting almost entirely behind the waitlist card.

## Ideas remaining (optional, prioritised)

- **Tap-the-map pin placement** — the "more magical" upgrade to the chip
  demo. Needs an explicit "try it" mode that captures gestures with a
  clear exit, or taps fight page scroll on mobile. Only worth it if the
  chip version feels too static.
- **Portrait crop for the mobile map fallback image** (only shows when
  the Mapbox token fails — low priority).
- Avoid fake social proof ("500 women waiting") — trips the brief's
  anti-goals (§7). Only add counts if they're real.

## Gotchas for whoever codes this (don't relearn the hard way)

- `NEXT_PUBLIC_*` env vars inline at **build time**. After changing them in
  Vercel, redeploy **without** build cache (or push a commit) or they won't
  take. This cost us a debugging round.
- mapbox-gl's own CSS forces `position: relative` on the map container; it's
  sized (`h-full w-full`), not positioned (`inset-0`). Don't "simplify" it.
- Supabase RLS is insert-only for anon; the client treats a 409 duplicate as
  success so membership never leaks. Keep that.
- Every animation must have a reduced-motion path and the map a no-token
  static fallback — both are hard requirements (§3.4, §5.2). And keep
  server and client render identical in components that branch on
  `useReducedMotion` — see the Reveal fix above.
- Hero scene positions come from `lib/hero-scene.ts` (viewport unproject
  after `cameraIdle`), not fixed coordinates — don't hard-code lng/lat for
  hero markers.
- The try-it scene must not stage on `cameraIdle` alone: if a scroll
  interrupts the flight to a venue, the camera idles at the *wrong act's*
  waypoint and the pin would drop there. `TryScene` checks the pin point
  unprojects to within 250m of the venue and otherwise waits for the next
  `moveend` (the hero's return trip flies back to the venue).

## Housekeeping (Tom, in Supabase)

- Re-run `supabase/schema.sql` (adds the `name` column).
- Delete the test row `claude-review-test@example.com` (postcode N1) from
  the Table Editor.
