"use client";

import { motion } from "framer-motion";

export const PIN_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The garnet teardrop, and its houselight/sage siblings (§3.3, §4). Falls
 * with spring weight when `drop` is true; renders pre-landed otherwise.
 * `glow` is the "seat saved" houselight halo.
 */
export function PinSvg({
  color = "var(--velvet)",
  size = 34,
  drop = false,
  glow = false,
}: {
  color?: string;
  size?: number;
  drop?: boolean;
  glow?: boolean;
}) {
  return (
    <motion.svg
      width={size}
      height={(size * 48) / 36}
      viewBox="0 0 36 48"
      initial={drop ? { y: -140, opacity: 0 } : false}
      animate={{
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 320, damping: 19, mass: 1.1 },
      }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      style={{
        display: "block",
        filter: glow
          ? "drop-shadow(0 0 10px rgba(228, 167, 92, 0.85))"
          : "drop-shadow(0 2px 4px rgba(46, 33, 40, 0.35))",
        transition: "filter 0.9s ease",
      }}
    >
      <path
        d="M18 1.5 C9 1.5 2 8.4 2 17.2 C2 28.5 18 46.5 18 46.5 C18 46.5 34 28.5 34 17.2 C34 8.4 27 1.5 18 1.5 Z"
        fill={color}
      />
      <circle cx="18" cy="17" r="5" fill="var(--paper)" opacity="0.9" />
    </motion.svg>
  );
}

/** One soft expanding ring at the pin's tip — fires once per mount. */
export function Ripple({ color = "var(--velvet)" }: { color?: string }) {
  return (
    <div className="absolute left-1/2 top-full h-10 w-10 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        className="h-full w-full rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ scale: 0.3, opacity: 0.55 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 1.3, ease: "easeOut" }}
      />
    </div>
  );
}

/** A woman on her way: houselight dot with a paper ring. */
export function AvatarDot({ pop = true }: { pop?: boolean }) {
  return (
    <motion.div
      className="h-[18px] w-[18px] rounded-full bg-houselight shadow-warm ring-2 ring-paper"
      initial={pop ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    />
  );
}
