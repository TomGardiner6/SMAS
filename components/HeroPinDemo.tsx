"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";

// Demo cast, near Soho Square (§4 Act I): she drops a pin; a woman two
// streets away answers and walks over.
const PIN: [number, number] = [-0.1316, 51.515];
const AVATAR_START: [number, number] = [-0.1361, 51.5124];
const AVATAR_END: [number, number] = [-0.1301, 51.5143];

const EASE = [0.22, 1, 0.36, 1] as const;
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
          ease: EASE,
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
        <PinVisual
          shown={pinShown || !!reduced}
          rippling={rippling}
          saved={saved || !!reduced}
        />,
        els.pin
      )}
      {createPortal(
        <AvatarVisual shown={avatarShown || !!reduced} bubble={bubbleShown || !!reduced} />,
        els.avatar
      )}
    </>
  );
}

function PinVisual({
  shown,
  rippling,
  saved,
}: {
  shown: boolean;
  rippling: boolean;
  saved: boolean;
}) {
  return (
    <div className="relative">
      {rippling && (
        <div className="absolute left-1/2 top-full h-10 w-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-full w-full rounded-full border-2 border-velvet"
            initial={{ scale: 0.3, opacity: 0.55 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
        </div>
      )}
      <AnimatePresence>
        {shown && (
          <motion.svg
            key="pin"
            width="34"
            height="46"
            viewBox="0 0 36 48"
            initial={{ y: -140, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 320, damping: 19, mass: 1.1 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            style={{
              display: "block",
              filter: saved
                ? "drop-shadow(0 0 10px rgba(228, 167, 92, 0.85))"
                : "drop-shadow(0 2px 4px rgba(46, 33, 40, 0.35))",
              transition: "filter 0.9s ease",
            }}
          >
            <path
              d="M18 1.5 C9 1.5 2 8.4 2 17.2 C2 28.5 18 46.5 18 46.5 C18 46.5 34 28.5 34 17.2 C34 8.4 27 1.5 18 1.5 Z"
              fill="var(--velvet)"
            />
            <circle cx="18" cy="17" r="5" fill="var(--paper)" opacity="0.9" />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

function AvatarVisual({ shown, bubble }: { shown: boolean; bubble: boolean }) {
  return (
    <div className="relative">
      <AnimatePresence>
        {shown && (
          <motion.div
            key="dot"
            className="h-[18px] w-[18px] rounded-full bg-houselight shadow-warm ring-2 ring-paper"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bubble && (
          <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2">
            <motion.div
              className="w-max rounded-full bg-paper px-3.5 py-1.5 font-ui text-xs font-semibold tracking-wide text-ink shadow-warm-lg"
              initial={{ scale: 0.6, opacity: 0, y: 6 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              On my way! 🚶‍♀️ 4 min
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
