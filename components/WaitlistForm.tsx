"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PinSvg } from "./pins";

type Status = "idle" | "submitting" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// just the outward bit: N1, SW9, E17…
const POSTCODE_AREA_RE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?$/;

/**
 * The waitlist (§4 Act V, §6): email + optional postcode area straight into
 * Supabase. Honeypot for bots, button disabled while saving, specific error
 * copy, and a duplicate email still reads as success — we never reveal
 * who's already on the list.
 */
export default function WaitlistForm() {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const form = formRef.current;
    if (!form) return;

    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const postcodeArea = String(data.get("postcode_area") ?? "").trim();
    const honeypot = String(data.get("website") ?? "");

    if (honeypot) {
      // a bot filled the invisible field; wave it through with a smile
      setStatus("done");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("That email doesn’t look right — check for typos.");
      return;
    }
    if (postcodeArea && !POSTCODE_AREA_RE.test(postcodeArea)) {
      setError("Just the first bit of the postcode, like N1 or SW9.");
      return;
    }

    setError(null);
    setStatus("submitting");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("missing config");
      const supabase = createClient(url, key);
      const { error: insertError } = await supabase.from("waitlist_signups").insert({
        email,
        postcode_area: postcodeArea || null,
      });
      // 23505 = already on the list; that's a success as far as she's concerned
      if (insertError && insertError.code !== "23505") throw insertError;
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(
        "That didn’t save — it’s us, not you. Try again in a minute, or email hello@savemeaseat.london and we’ll add you by hand."
      );
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="mt-8 flex flex-col items-center gap-4">
        <PinSvg size={30} drop={!reduced} glow />
        <p className="display text-2xl">Seat saved.</p>
        <p className="text-ink/80">
          We&rsquo;ll write when the house lights go up in London.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} className="mt-8 text-left" noValidate>
      <label htmlFor="waitlist-email" className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink/70">
        Email
      </label>
      <div className="relative mt-1">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="peer w-full border-b border-ink/25 bg-transparent py-2.5 font-body text-lg outline-none placeholder:text-ink/35 focus:outline-none"
        />
        {/* the underline draws itself in velvet on focus (§3.4) */}
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-velvet transition-transform duration-300 ease-out peer-focus:scale-x-100"
        />
      </div>

      <label htmlFor="waitlist-postcode" className="mt-5 block font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink/70">
        Postcode area <span className="normal-case tracking-normal text-ink/65">(optional — helps us pick first neighbourhoods)</span>
      </label>
      <div className="relative mt-1">
        <input
          id="waitlist-postcode"
          name="postcode_area"
          type="text"
          autoComplete="postal-code"
          placeholder="SW9"
          className="peer w-24 border-b border-ink/25 bg-transparent py-2.5 font-body text-lg outline-none placeholder:text-ink/35 focus:outline-none"
        />
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-0.5 w-24 origin-left scale-x-0 bg-velvet transition-transform duration-300 ease-out peer-focus:scale-x-100"
        />
      </div>

      {/* honeypot: humans never see it, bots can't resist it */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="waitlist-website">Website</label>
        <input id="waitlist-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            className="mt-4 text-sm text-velvet"
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-7 w-full rounded-full bg-velvet px-8 py-4 font-ui text-sm font-semibold uppercase tracking-[0.08em] text-paper shadow-warm transition duration-150 hover:shadow-warm-lg active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "submitting" ? "Saving your seat…" : "Join the waitlist"}
      </button>
    </form>
  );
}
