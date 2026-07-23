import HeroMap from "@/components/HeroMap";

export default function Home() {
  return (
    <main>
      {/* Act I — the pin drop (§4). Live map behind, copy on the left third
          over a soft paper scrim so text stays readable (§9). */}
      <section className="relative flex min-h-svh items-center overflow-hidden">
        <HeroMap />
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
              Drop a pin wherever you are (a pub, a foyer, the good seats) and a
              verified woman nearby will come and join you.
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
    </main>
  );
}
