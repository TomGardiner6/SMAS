"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { PinSvg } from "./pins";
import { WAYPOINTS } from "@/lib/map-theatre";

/**
 * Act IV's velvet pin, on the Royal Albert Hall itself. The card next to
 * it says "a spare ticket is a velvet pin: drop it" — so the map has to
 * show one, or the copy is making a claim the spine refuses to back up.
 * One pin, one label, no walk: the interval is a short act (§4), and the
 * full drop-ripple-walk choreography belongs to the hero (§3.3).
 */
export default function IntervalPin({ map }: { map: MapboxMap }) {
  const reduced = useReducedMotion();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let marker: Marker | undefined;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;
      const node = document.createElement("div");
      marker = new mapboxgl.Marker({ element: node, anchor: "bottom" })
        .setLngLat(WAYPOINTS.albertHall.center)
        .addTo(map);
      setEl(node);
    })();
    return () => {
      cancelled = true;
      marker?.remove();
    };
  }, [map]);

  // the seat isn't taken here — it's going, so the glow arrives late and
  // stays, echoing the "1 seat, saved for someone" line on the ticket
  useEffect(() => {
    if (!el) return;
    if (reduced) {
      setLanded(true);
      return;
    }
    const t = setTimeout(() => setLanded(true), 900);
    return () => clearTimeout(t);
  }, [el, reduced]);

  if (!el) return null;

  return createPortal(
    <div className="relative flex flex-col items-center">
      <motion.div
        className="mb-1 w-max rounded-full bg-paper px-2.5 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-ink shadow-warm"
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 1.1, duration: 0.5 }}
      >
        1 seat going
      </motion.div>
      {/* no ripple: that flourish is the hero pin's alone (§3.3), same
          reason Act II's vibe pins go without one */}
      <PinSvg size={30} drop={!reduced} glow={landed} />
    </div>,
    el,
    "interval-pin"
  );
}
