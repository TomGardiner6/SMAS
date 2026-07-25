"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";

// A scatter of evenings-in-progress across London (§4 Act V). The centre
// is where the nights actually are, but at this zoom the waitlist card
// covers almost exactly that box — 14 of the original 16 pins landed
// behind it, so the city read as empty. The outer ring is what makes the
// scatter visible, and it is also more honest: this is London-first, not
// zone-1-first.
const SPOTS: [number, number][] = [
  // central
  [-0.1276, 51.5072], // Trafalgar Square
  [-0.141, 51.5152], // Soho
  [-0.1226, 51.5117], // Covent Garden
  [-0.0865, 51.5136], // Bank
  [-0.0972, 51.521], // Barbican
  [-0.1774, 51.5009], // Royal Albert Hall
  [-0.116, 51.5033], // South Bank
  [-0.0757, 51.5055], // Tower
  [-0.1533, 51.5237], // Regent's Park
  [-0.1065, 51.531], // Islington
  [-0.068, 51.545], // Hackney
  [-0.196, 51.509], // Notting Hill
  [-0.1425, 51.492], // Pimlico
  [-0.0235, 51.5054], // Canary Wharf
  [-0.174, 51.546], // Hampstead
  [-0.091, 51.475], // Camberwell
  // the rest of the city — chosen to sit in the bands either side of the
  // waitlist card at this zoom, so the scatter reads instead of hiding
  [-0.2876, 51.4877], // Kew
  [-0.2795, 51.556], // Wembley
  [-0.2674, 51.5085], // Acton
  [-0.256, 51.492], // Chiswick
  [-0.223, 51.4927], // Hammersmith
  [-0.216, 51.461], // Putney
  [-0.146, 51.571], // Highgate
  [-0.138, 51.462], // Clapham
  [-0.086, 51.446], // Dulwich
  [-0.0694, 51.4681], // Peckham
  [-0.025, 51.53], // Bow
  [-0.0166, 51.5432], // Olympic Park
  [-0.013, 51.556], // Leyton
  [-0.0098, 51.4816], // Greenwich
  [0.008, 51.466], // Blackheath
];

/** Dim pins glow on across the wide city while the waitlist card asks
 * for a seat — the room filling up. */
export default function WaitlistPins({ map }: { map: MapboxMap }) {
  const reduced = useReducedMotion();
  const [els, setEls] = useState<HTMLDivElement[]>([]);

  useEffect(() => {
    let cancelled = false;
    const markers: Marker[] = [];
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;
      const created = SPOTS.map((lngLat) => {
        const el = document.createElement("div");
        markers.push(
          new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat(lngLat).addTo(map)
        );
        return el;
      });
      setEls(created);
    })();
    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
    };
  }, [map]);

  return (
    <>
      {els.map((el, i) =>
        createPortal(
          <motion.div
            className="h-3 w-3 rounded-full bg-velvet ring-2 ring-paper/70"
            // the houselight halo is what reads as "lit" at this zoom; the
            // dot alone was too small and too faint to notice at all
            style={{ boxShadow: "0 0 10px 2px rgba(228, 167, 92, 0.75)" }}
            initial={reduced ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.9, delay: reduced ? 0 : (i % 5) * 0.35 + i * 0.08 }}
          />,
          el,
          `waitlist-pin-${i}`
        )
      )}
    </>
  );
}
