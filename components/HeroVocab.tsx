"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useStage } from "./Stage";
import { PIN_EASE } from "./pins";

// The hero's top vocab. Picking the French chip swaps the whole register;
// every other chip just relocates the eyebrow ("— Wimbledon"). "Posé un
// lapin ?" is the idiom for being stood up — elliptical, like "Stood up?".
const VOCAB = {
  en: {
    seat: "Save me a seat",
    headline: "Stood up? Spare ticket? Someone nearby will take that seat.",
  },
  fr: {
    seat: "Garde-moi une place",
    headline: "Posé un lapin ? Un billet en trop ? Une voisine prendra ce siège.",
  },
} as const;

/**
 * Eyebrow + headline, re-dealt word by word when a reason chip retunes
 * them: the old line drifts up and out while the new words rise in on a
 * stagger — a shuffle, never a hard cut. Reduced motion swaps instantly.
 */
export default function HeroVocab() {
  const { reason } = useStage();
  const lang = reason?.lang ?? "en";
  const area = reason?.place.area ?? "London";
  const v = VOCAB[lang];
  const frAttr = lang === "fr" ? "fr" : undefined;

  return (
    <>
      <p className="eyebrow text-velvet">
        <SwapWords swapKey={`${lang}-${area}`} text={`${v.seat} — ${area}`} lang={frAttr} />
      </p>
      <h1 className="display mt-4 text-[clamp(2.4rem,7vw,5.5rem)] md:mt-5">
        <SwapWords swapKey={lang} text={v.headline} lang={frAttr} />
      </h1>
    </>
  );
}

function SwapWords({ swapKey, text, lang }: { swapKey: string; text: string; lang?: string }) {
  const reduced = useReducedMotion();
  // the mount-time line renders static (SSR markup must match the client),
  // so words only animate once a chip has actually changed the text
  const firstKey = useRef(swapKey);
  const entering = swapKey !== firstKey.current && !reduced;
  const words = text.split(" ");

  return (
    <span className="grid">
      <AnimatePresence initial={false}>
        <motion.span
          key={swapKey}
          lang={lang}
          className="block [grid-area:1/1]"
          exit={{
            opacity: 0,
            y: reduced ? 0 : -12,
            transition: { duration: reduced ? 0 : 0.3, ease: "easeIn" },
          }}
        >
          {words.map((w, i) => (
            <motion.span
              key={`${swapKey}-${i}`}
              className="inline-block whitespace-pre"
              initial={entering ? { opacity: 0, y: "0.35em" } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: PIN_EASE, delay: 0.1 + i * 0.05 }}
            >
              {i < words.length - 1 ? w + " " : w}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
