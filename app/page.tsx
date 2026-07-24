import Stage from "@/components/Stage";
import ActTwo from "@/components/ActTwo";
import Reveal from "@/components/Reveal";
import TicketCard from "@/components/TicketCard";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <Stage>
      <a
        href="#waitlist"
        className="sr-only z-20 rounded-full bg-paper px-4 py-2 font-ui text-sm text-velvet focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the waitlist
      </a>
      <main className="relative z-10">
        {/* Act I — the pin drop (§4). Copy on the left third over a soft
            paper scrim; the shared map glides beneath every act. */}
        <section data-act="hero" className="relative flex min-h-svh items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-paper via-paper/60 to-transparent md:w-2/3"
          />
          <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
            <div className="max-w-2xl py-24">
              <p className="eyebrow text-velvet">Save me a seat — London</p>
              <h1 className="display mt-5 text-[clamp(2.75rem,7vw,5.5rem)]">
                Stood up? Spare ticket? Someone nearby will take that seat.
              </h1>
              <p className="mt-7 max-w-md text-lg md:text-xl">
                Drop a pin wherever you are (a pub, a foyer, the good seats) and
                a verified woman nearby will come and join you.
              </p>
              <a
                href="#waitlist"
                className="mt-10 inline-block rounded-full bg-velvet px-8 py-4 font-ui text-sm font-semibold uppercase tracking-[0.08em] text-paper shadow-warm transition duration-150 hover:shadow-warm-lg active:scale-[0.97]"
              >
                Join the waitlist
              </a>
            </div>
          </div>
        </section>

        {/* Act II — how it works. Map glides east to Covent Garden; each
            step syncs a map event; tap-through on mobile. */}
        <section data-act="how" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-32 md:px-10">
            <ActTwo />
          </div>
        </section>

        {/* Act III — safety, the emotional core. South Bank at dusk. */}
        <section data-act="safety" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-40 md:px-10">
            <Reveal className="max-w-xl">
              <div className="rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-12">
                <p className="eyebrow text-velvet">Act III — The safety layer</p>
                <h2 className="display mt-4 text-4xl md:text-6xl">
                  Built so your gut can relax.
                </h2>
                <ul className="mt-10 space-y-6 text-lg">
                  {[
                    "Every member is ID-verified before her first pin.",
                    "Pins live in public places only.",
                    "One tap alerts the contacts you chose, or rings your phone with a very convincing fake call.",
                    "A gentle check-in nudge, halfway through your meetup.",
                  ].map((fact, i) => (
                    <li key={fact}>
                      <Reveal delay={i * 0.12} className="flex gap-4">
                        <span
                          aria-hidden
                          className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
                        />
                        {fact}
                      </Reveal>
                    </li>
                  ))}
                </ul>
                <Reveal delay={0.5}>
                  <p className="mt-10 text-ink/80">
                    Afterwards, ratings are private and positive-only. Kindness
                    gets a small medal, never a public score.
                  </p>
                  <p className="mt-5 font-ui text-sm font-semibold uppercase tracking-[0.08em] text-velvet">
                    Women-only · London-first
                  </p>
                </Reveal>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Act IV — the interval bar: spare tickets. Royal Albert Hall. */}
        <section data-act="interval" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-32 md:px-10">
            <Reveal className="ml-auto max-w-md">
              <div className="rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-10">
                <p className="eyebrow text-velvet">Act IV — The interval bar</p>
                <h2 className="display mt-4 text-4xl md:text-5xl">
                  Her plus-one cancelled. Your favourite band. Everyone wins.
                </h2>
                <p className="mt-5">
                  A spare ticket is a velvet pin: drop it, and the seat beside
                  you goes to someone who actually wanted to be there.
                </p>
                <TicketCard />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Act V — the waitlist. Wide London, dim pins glowing on. */}
        <section
          data-act="waitlist"
          id="waitlist"
          className="relative flex min-h-svh items-center"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-32 md:px-10">
            <Reveal className="mx-auto max-w-lg">
              <div className="rounded-2xl bg-paper p-8 text-center shadow-warm-lg md:p-12">
                <p className="eyebrow text-velvet">Act V — Take your seat</p>
                <h2 className="display mt-4 text-5xl md:text-6xl">Save your seat.</h2>
                <p className="mt-5">
                  We&rsquo;re opening in London first. Leave your details and
                  you&rsquo;ll be first through the doors.
                </p>
                <WaitlistForm />
              </div>
            </Reveal>

            <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-ui text-xs text-ink/70">
              <span>© 2026 Save Me A Seat</span>
              <a href="mailto:mayasexton1@gmail.com" className="transition-colors hover:text-velvet">
                mayasexton1@gmail.com
              </a>
              <a href="/privacy" className="transition-colors hover:text-velvet">
                Privacy
              </a>
            </footer>
          </div>
        </section>
      </main>
    </Stage>
  );
}
