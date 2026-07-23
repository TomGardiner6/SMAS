"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { AvatarDot, PinSvg, Ripple, PIN_EASE } from "./pins";

// Demo cast, near Soho Square (§4 Act I): she drops a pin; a woman two
// streets away answers and walks over.
const PIN: [number, number] = [-0.1316, 51.515];
const AVATAR_START: [number, number] = [-0.1361, 51.5124];
const AVATAR_END: [number, number] = [-0.1301, 51.5143];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The scripted hero sequence (§4): pin falls with weight and ripples;
 * an avatar slides in from two streets away; "On my way!" pops; the pin
 * gains a houselight glow. Loops gently every ~20s. Under reduced motion
 * everything renders pre-landed and stays put.
 */
export default function HeroPinDemo({ map }: { map: MapboxMap }) {
  const reduced = useReducedMotion();
  const [els, setEls] = useState<{ pin: HTMLDivElement; avatar: HTMLDivElement } | null>(null);
  const avatarMarker = useRef<Marker | null>(null);

  const [pinShown, setPinShown] = useState(false);
  const [rippling, setRippling] = useState(false);
  const [avatarShown, setAvatarShown] = useState(false);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let markers: Marker[] = [];
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;
      const pinEl = document.createElement("div");
      const avatarEl = document.createElement("div");
      const pin = new mapboxgl.Marker({ element: pinEl, anchor: "bottom" })
        .setLngLat(PIN)
        .addTo(map);
      const avatar = new mapboxgl.Marker({ element: avatarEl, anchor: "center" })
        .setLngLat(AVATAR_START)
        .addTo(map);
      avatarMarker.current = avatar;
      markers = [pin, avatar];
      setEls({ pin: pinEl, avatar: avatarEl });
    })();
    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
    };
  }, [map]);

  useEffect(() => {
    if (!els) return;

    if (reduced) {
      // pre-landed scene; visuals derive from `reduced` at render
      avatarMarker.current?.setLngLat(AVATAR_END);
      return;
    }

    let cancelled = false;
    let walk: ReturnType<typeof animate> | undefined;

    (async () => {
      await sleep(3000);
      while (!cancelled) {
        setPinShown(true); // spring drop, ~0.65s to landing
        await sleep(650);
        if (cancelled) break;
        setRippling(true);
        await sleep(850);
        if (cancelled) break;
        avatarMarker.current?.setLngLat(AVATAR_START);
        setAvatarShown(true);
        walk = animate(0, 1, {
          duration: 1.9,
          ease: PIN_EASE,
          onUpdate: (t) =>
            avatarMarker.current?.setLngLat([
              AVATAR_START[0] + (AVATAR_END[0] - AVATAR_START[0]) * t,
              AVATAR_START[1] + (AVATAR_END[1] - AVATAR_START[1]) * t,
            ]),
        });
        await sleep(2100);
        if (cancelled) break;
        setBubbleShown(true);
        await sleep(1300);
        if (cancelled) break;
        setSaved(true); // seat saved: houselight glow
        await sleep(10600);
        if (cancelled) break;
        setPinShown(false);
        setAvatarShown(false);
        setBubbleShown(false);
        setSaved(false);
        setRippling(false);
        await sleep(2500); // dark stage, then the scene replays
      }
    })();

    return () => {
      cancelled = true;
      walk?.stop();
    };
  }, [els, reduced]);

  if (!els) return null;

  return (
    <>
      {createPortal(
        <div className="relative">
          {rippling && <Ripple />}
          <AnimatePresence>
            {(pinShown || reduced) && (
              <PinSvg key="pin" drop={!reduced} glow={saved || !!reduced} />
            )}
          </AnimatePresence>
        </div>,
        els.pin
      )}
      {createPortal(
        <div className="relative">
          <AnimatePresence>
            {(avatarShown || reduced) && <AvatarDot key="dot" pop={!reduced} />}
          </AnimatePresence>
          <AnimatePresence>
            {(bubbleShown || reduced) && (
              <div key="bubble" className="absolute bottom-[28px] left-1/2 -translate-x-1/2">
                <motion.div
                  className="w-max rounded-full bg-paper px-3.5 py-1.5 font-ui text-xs font-semibold tracking-wide text-ink shadow-warm-lg"
                  initial={reduced ? false : { scale: 0.6, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  On my way! 🚶‍♀️ 4 min
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>,
        els.avatar
      )}
    </>
  );
}
