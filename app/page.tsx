import MapBackdrop from "@/components/MapBackdrop";

export default function Home() {
  return (
    <>
      <MapBackdrop />
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

        {/* Act II — how it works. Map glides east to Covent Garden. */}
        <section data-act="how" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-32 md:px-10">
            <div className="max-w-md">
              <div className="rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-10">
                <p className="eyebrow text-velvet">Act II — How it works</p>
                <h2 className="display mt-4 text-4xl md:text-5xl">
                  Drop a pin. Company comes to you.
                </h2>
              </div>

              <ol className="mt-8 space-y-8">
                <li className="rounded-2xl bg-paper/95 p-8 shadow-warm">
                  <h3 className="display text-2xl">1. Drop a pin</h3>
                  <p className="mt-3">
                    Public places only. Pick your vibe: chatty, low-key company,
                    or a spare ticket going begging.
                  </p>
                </li>
                <li className="rounded-2xl bg-paper/95 p-8 shadow-warm">
                  <h3 className="display text-2xl">2. Someone says “on my way”</h3>
                  <p className="mt-3">
                    Verified women nearby see your pin. You choose who takes the
                    seat.
                  </p>
                </li>
                <li className="rounded-2xl bg-paper/95 p-8 shadow-warm">
                  <h3 className="display text-2xl">3. Company, on your terms</h3>
                  <p className="mt-3">
                    Chat in the app, meet in the open, and the pin closes when
                    you&rsquo;re happy.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Act III — safety, the emotional core. South Bank at dusk. */}
        <section data-act="safety" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-40 md:px-10">
            <div className="max-w-xl rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-12">
              <p className="eyebrow text-velvet">Act III — The safety layer</p>
              <h2 className="display mt-4 text-4xl md:text-6xl">
                Built so your gut can relax.
              </h2>
              <ul className="mt-8 space-y-5 text-lg">
                <li>Every member is ID-verified before her first pin.</li>
                <li>Pins live in public places only.</li>
                <li>
                  One tap alerts the contacts you chose, or rings your phone
                  with a very convincing fake call.
                </li>
                <li>A gentle check-in nudge, halfway through your meetup.</li>
              </ul>
              <p className="mt-8 text-ink/80">
                Afterwards, ratings are private and positive-only. Kindness gets
                a small medal, never a public score.
              </p>
              <p className="mt-4 font-ui text-sm font-semibold uppercase tracking-[0.08em] text-velvet">
                Women-only · London-first
              </p>
            </div>
          </div>
        </section>

        {/* Act IV — the interval bar: spare tickets. Royal Albert Hall. */}
        <section data-act="interval" className="relative">
          <div className="mx-auto max-w-6xl px-6 py-32 md:px-10">
            <div className="ml-auto max-w-md rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-10">
              <p className="eyebrow text-velvet">Act IV — The interval bar</p>
              <h2 className="display mt-4 text-4xl md:text-5xl">
                Her plus-one cancelled. Your favourite band. Everyone wins.
              </h2>
              <p className="mt-5">
                A spare ticket is a velvet pin: drop it, and the seat beside you
                goes to someone who actually wanted to be there.
              </p>
            </div>
          </div>
        </section>

        {/* Act V — the waitlist. Wide London, dim pins glowing on. */}
        <section data-act="waitlist" id="waitlist" className="relative flex min-h-svh items-center">
          <div className="mx-auto w-full max-w-6xl px-6 py-32 md:px-10">
            <div className="mx-auto max-w-lg rounded-2xl bg-paper p-8 text-center shadow-warm-lg md:p-12">
              <p className="eyebrow text-velvet">Act V — Take your seat</p>
              <h2 className="display mt-4 text-5xl md:text-6xl">Save your seat.</h2>
              <p className="mt-5">
                We open in London first. Leave your email and we&rsquo;ll write
                when the house lights go up.
              </p>
              {/* The waitlist form (Supabase) lands here in build step 5. */}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
