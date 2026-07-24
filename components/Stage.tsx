"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import type { Map as MapboxMap } from "mapbox-gl";
import MapStage from "./MapStage";
import HeroPinDemo from "./HeroPinDemo";
import WaitlistPins from "./WaitlistPins";
import { WAYPOINTS } from "@/lib/map-theatre";

export type Act = "hero" | "how" | "safety" | "interval" | "waitlist";

const ACT_WAYPOINTS: Record<Act, { center: [number, number]; zoom: number; pitch: number }> = {
  hero: WAYPOINTS.hero,
  how: WAYPOINTS.coventGarden,
  safety: WAYPOINTS.southBank,
  interval: WAYPOINTS.albertHall,
  waitlist: WAYPOINTS.wideLondon,
};

const StageContext = createContext<{
  map: MapboxMap | null;
  act: Act;
  userPinActive: boolean;
  setUserPinActive: (v: boolean) => void;
}>({
  map: null,
  act: "hero",
  userPinActive: false,
  setUserPinActive: () => {},
});

export const useStage = () => useContext(StageContext);

/**
 * The map is the spine of the page (§3.4): one fixed instance behind all
 * five acts. Scrolling a section past the middle of the viewport glides the
 * camera to that act's waypoint — discrete flights, never per-pixel
 * scrubbing. Reduced motion cuts instantly instead of flying. Sections get
 * the map and active act via useStage() for their own synced events.
 */
export default function Stage({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MapboxMap | null>(null);
  const [act, setAct] = useState<Act>("hero");
  // once the visitor drops her own pin (TryPinDemo), the scripted hero
  // loop stands down for good — two casts on one stage would collide
  const [userPinActive, setUserPinActive] = useState(false);
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
            // instant cut (jumpTo's typings lack offset)
            map.easeTo({ center: wp.center, zoom: wp.zoom, pitch: wp.pitch, offset, duration: 0 });
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
    <StageContext.Provider value={{ map, act, userPinActive, setUserPinActive }}>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <MapStage className="absolute inset-0" onReady={setMap} />
        {/* per-act scenes mount only while their act plays, so markers never
            photobomb the next scene; each replays on scrolling back */}
        {map && act === "hero" && !userPinActive ? <HeroPinDemo map={map} /> : null}
        {map && act === "waitlist" ? <WaitlistPins map={map} /> : null}
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
      {children}
    </StageContext.Provider>
  );
}
