# SMAS — next iteration plan

Working handover for the round of changes after the initial build. The site
is live and functioning on Vercel (map, scripted pin-drop, scroll
choreography, Supabase waitlist all verified working). Read
[smas-site-brief.md](smas-site-brief.md) for the design bible; this file is
just the delta.

## Done in this pass (frontend only, no DB risk)
- Removed the "Made in London" footer badge (it isn't true).
- De-duplicated the waitlist copy: the Act V intro no longer pre-says the
  success line. Intro now "…you'll be first through the doors"; success now
  "You're on the list — we'll write the moment we open in London." Both are
  easy to tweak to taste.

## To build next

### 1. Name field on the waitlist  — small, but DB-sequenced
Add an optional `Name` input above Email.
- **DB first (user runs in Supabase SQL editor):**
  `alter table public.waitlist_signups add column if not exists name text;`
  Also add the column to `supabase/schema.sql` so a fresh setup matches.
- Then: add the input to `WaitlistForm.tsx`, include `name` in the insert
  payload, personalise the success ("Seat saved, Maya.").
- **Sequencing matters:** deploy the code that sends `name` only *after* the
  column exists, or every insert 400s and the waitlist breaks. Run the SQL,
  confirm, then push.

### 2. Interactive "drop a pin" demo  — moderate (Fable)
Turn the passive hero animation into something the visitor does themselves.
One new component (~200 lines) reusing the existing `PinSvg` / `AvatarDot` /
`Ripple` and the shared map instance from `Stage`.
Flow: enable interaction on a scoped surface → user drops a pin → picks a
reason (see §3) → a canned "she's on her way" reply plays (reuse
`HeroPinDemo`'s walk logic).
- **The one real UX fork — pick before building:**
  - **(A) Tap the map to drop** — most "real", but the map is the scrolling
    background, so on mobile a tap-to-place fights the scroll. Needs an
    explicit "Try it" mode that temporarily captures gestures, with a clear
    exit. Recommended if we accept the mobile care.
  - **(B) "Drop a pin here" button** — drops at the current map centre.
    Scroll-safe, works identically on mobile, less exploratory. Lower risk.
  - Recommendation: **B for a first cut** (ships clean everywhere), leave A
    as a follow-up if it feels too static.
- Keep `interactive: false` as the default everywhere else (§5.2); only the
  demo surface opts in.
- Reduced-motion + no-token fallback must still hold.

### 3. "Reasons" / categories  — small-to-moderate, high appeal
Tom's idea: surface concrete uses — *a tennis partner, a study buddy, a
native Spanish speaker for coffee, just a new face for dinner*. This makes
the product feel specific and broad, not just "company." Two ways:
  - **(A) Rotating "I'm looking for…" showcase** — an animated line or small
    editorial list in the hero or Act II. Cheap, high impact, doesn't touch
    the pin mechanic. Good standalone.
  - **(B) Fold reasons into the demo** — dropping a pin includes picking a
    reason; the reply references it. More compelling, ties §2 and §3
    together, more work.
  - The current three colour "vibes" (chatty/low-key/spare-ticket, §4 Act II)
    are a *tone* axis and are baked into the pin colours. Reasons are an
    *activity* axis — keep them separate rather than overloading the colours.
  - Recommendation: ship **(A)** regardless (it's a quick win), and do **(B)**
    if we build the interactive demo.

### 4. Other appeal ideas (optional, prioritised)
- **Personalised success** with the name field ("Seat saved, Maya.").
- **Mobile fallback image** is desktop-cropped; a portrait crop would look
  more deliberate (only shows when the token fails, so low priority).
- Avoid fake social proof ("500 women waiting") — it reads generated and
  trips the brief's anti-goals (§7). Only add counts if they're real.

## Gotchas for whoever codes this (don't relearn the hard way)
- `NEXT_PUBLIC_*` env vars inline at **build time**. After changing them in
  Vercel, redeploy **without** build cache (or push a commit) or they won't
  take. This cost us a debugging round.
- mapbox-gl's own CSS forces `position: relative` on the map container; it's
  sized (`h-full w-full`), not positioned (`inset-0`). Don't "simplify" it.
- Supabase RLS is insert-only for anon; the client treats a 409 duplicate as
  success so membership never leaks. Keep that.
- Every animation must have a reduced-motion path and the map a no-token
  static fallback — both are hard requirements (§3.4, §5.2).

## Housekeeping
- Delete the test row `claude-review-test@example.com` (postcode N1) from the
  Supabase Table Editor.
