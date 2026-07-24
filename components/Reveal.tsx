"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PIN_EASE } from "./pins";

/** Soft fade + rise on scroll into view (§3.4); an instant cut under
 * reduced motion. The markup is identical on server and client — branching
 * to a plain <div> when reduced left the SSR'd opacity:0 stuck on the DOM
 * (React doesn't patch mismatched styles), hiding whole sections. */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.65, delay, ease: PIN_EASE }}
    >
      {children}
    </motion.div>
  );
}
