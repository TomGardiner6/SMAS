/**
 * A spare-ticket pin rendered as a small theatre ticket (§4 Act IV):
 * Archivo details, a perforated stub, punched notches where the tear
 * begins. Static markup — the future marketplace, only planted.
 */
export default function TicketCard() {
  return (
    <div
      className="mt-8 flex overflow-hidden rounded-xl bg-paper shadow-warm-lg"
      style={{
        // punch the tear-line notches out of the card; browsers without
        // mask-composite simply show square corners there
        maskImage:
          "radial-gradient(circle 9px at calc(100% - 88px) 0, transparent 8px, black 9px), radial-gradient(circle 9px at calc(100% - 88px) 100%, transparent 8px, black 9px)",
        maskComposite: "intersect",
        WebkitMaskImage:
          "radial-gradient(circle 9px at calc(100% - 88px) 0, transparent 8px, black 9px), radial-gradient(circle 9px at calc(100% - 88px) 100%, transparent 8px, black 9px)",
        WebkitMaskComposite: "source-in",
      }}
    >
      <div className="flex-1 p-6">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-velvet">
          Spare ticket · Tonight
        </p>
        <p className="display mt-2 text-2xl">Royal Albert Hall</p>
        <p className="mt-1 font-ui text-xs uppercase tracking-wide text-ink/70">
          Door 6 · Stalls K · 7.30pm
        </p>
        <p className="mt-4 inline-flex items-center gap-2 font-ui text-xs font-semibold uppercase tracking-wide text-ink/80">
          <svg width="12" height="16" viewBox="0 0 36 48" aria-hidden>
            <path
              d="M18 1.5 C9 1.5 2 8.4 2 17.2 C2 28.5 18 46.5 18 46.5 C18 46.5 34 28.5 34 17.2 C34 8.4 27 1.5 18 1.5 Z"
              fill="var(--velvet)"
            />
          </svg>
          1 seat, saved for someone
        </p>
      </div>
      <div className="flex w-[88px] items-center justify-center border-l-2 border-dashed border-ink/25 p-3">
        <p className="rotate-180 font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/65 [writing-mode:vertical-rl]">
          Admit one
        </p>
      </div>
    </div>
  );
}
