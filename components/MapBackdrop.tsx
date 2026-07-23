"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Map as MapboxMap } from "mapbox-gl";
import MapStage from "./MapStage";
import HeroPinDemo from "./HeroPinDemo";
import { WAYPOINTS } from "@/lib/map-theatre";

export type Act = "hero" | "how" | "safety" | "interval" | "waitlist";

const ACT_WAYPOINTS: Record<Act, { center: [number, number]; zoom: number; pitch: number }> = {
  hero: WAYPOINTS.hero,
  how: WAYPOINTS.coventGarden,
  safety: WAYPOINTS.southBank,
  interval: WAYPOINTS.albertHall,
  waitlist: WAYPOINTS.wideLondon,
};

/**
 * The map is the spine of the page (§3.4): one fixed instance behind all
 * five acts. Scrolling a section past the middle of the viewport glides the
 * camera to that act's waypoint — discrete flights, never per-pixel
 * scrubbing. Reduced motion cuts instantly instead of flying.
 */
export default function MapBackdrop() {
  const [map, setMap] = useState<MapboxMap | null>(null);
  const [act, setAct] = useState<Act>("hero");
  const actRef = useRef(act);

  useEffect(() => {
    if (!map) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-act]"));
    if (sections.length === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const next = entry.target.getAttribute("data-act") as Act | null;
          if (!next || next === actRef.current || !(next in ACT_WAYPOINTS)) continue;
          actRef.current = next;
          setAct(next);
          const wp = ACT_WAYPOINTS[next];
          // keep the landmark clear of that act's copy card on desktop
          const offset: [number, number] =
            next === "interval" && window.innerWidth >= 768 ? [-240, 0] : [0, 0];
          if (reduced) {
            map.jumpTo({ center: wp.center, zoom: wp.zoom, pitch: wp.pitch, offset });
          } else {
            map.flyTo({
              center: wp.center,
              zoom: wp.zoom,
              pitch: wp.pitch,
              offset,
              duration: 2600,
              curve: 1.3,
            });
          }
        }
      },
      // a section becomes the active act when it crosses the middle band
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [map]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <MapStage className="absolute inset-0" onReady={setMap} />
      {/* the demo belongs to Act I; unmounting clears its markers so they
          don't photobomb later acts, and the scene replays on return */}
      {map && act === "hero" ? <HeroPinDemo map={map} /> : null}
      {/* Act III settles on the South Bank at dusk: a warm tint, not a style swap (§4) */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(140, 47, 63, 0.14), rgba(228, 167, 92, 0.1))",
        }}
        initial={false}
        animate={{ opacity: act === "safety" ? 1 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </div>
  );
}
