import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Save Me A Seat",
  description: "What we collect (almost nothing) and what we do with it.",
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <p className="eyebrow text-velvet">Save me a seat — London</p>
      <h1 className="display mt-4 text-4xl md:text-5xl">Privacy</h1>
      <div className="mt-8 space-y-5">
        <p>
          This site collects one thing: the email address you give us for the
          waitlist, plus a postcode area if you choose to add one. We use it to
          write to you about Save Me A Seat, and for nothing else.
        </p>
        <p>
          There are no analytics, no tracking pixels, no cookies beyond what
          the site needs to function, and your details are never sold or
          shared.
        </p>
        <p>
          Want off the list? Email{" "}
          <a
            href="mailto:mayasexton1@gmail.com"
            className="text-velvet underline underline-offset-2"
          >
            mayasexton1@gmail.com
          </a>{" "}
          and we&rsquo;ll delete you promptly, no questions.
        </p>
      </div>
      <p className="mt-12">
        <Link href="/" className="font-ui text-sm font-semibold uppercase tracking-[0.08em] text-velvet">
          ← Back to the map
        </Link>
      </p>
    </main>
  );
}
