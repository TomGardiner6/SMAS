"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useStage } from "./Stage";
import { AvatarDot, PinSvg, Ripple, PIN_EASE } from "./pins";
import { cameraIdle, heroScene, type HeroScene } from "@/lib/hero-scene";

// The reasons chips double as the "what's this for?" showcase — tennis,
// study, dinner, language — so the breadth of the product is visible in the
// hero even before anyone taps.
const REASONS = [
  { id: "tennis", chip: "A tennis partner", reply: "I’ll bring rackets 🎾 6 min" },
  { id: "study", chip: "A study buddy", reply: "Laptop’s in my bag 📚 5 min" },
  { id: "dinner", chip: "A new face for dinner", reply: "Save me a seat 🍷 4 min" },
  { id: "french", chip: "A native French speaker", reply: "J’arrive ! 🇫🇷 5 min" },
] as const;

type Reason = (typeof REASONS)[number];

const PHASES = ["drop", "ripple", "walk", "bubble", "saved"] as const;
type Phase = (typeof PHASES)[number];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The hero demo you do yourself: pick who you need tonight and your pin
 * drops on the real map — ripple, a woman walks over, and her reply answers
 * the reason you chose. No map taps needed, so it can't fight page scroll
 * on mobile; under reduced motion the scene renders pre-landed.
 */
export default function TryPinDemo() {
  const { map, setUserPinActive } = useStage();
  const reduced = useReducedMotion();
  const [reason, setReason] = useState<Reason | null>(null);

  return (
    <div className="mt-10 max-w-md">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink/70">
        Try it — who do you need tonight?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const selected = reason?.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setUserPinActive(true);
                setReason(r);
              }}
              className={`rounded-full px-4 py-2 font-ui text-xs font-semibold tracking-wide shadow-warm transition duration-150 active:scale-[0.97] ${
                selected
                  ? "bg-paper text-ink ring-2 ring-houselight"
                  : "bg-paper/90 text-ink/80 hover:text-ink"
              }`}
            >
              {r.chip}
            </button>
          );
        })}
      </div>
      {/* the map layer is aria-hidden, so narrate the scene here instead */}
      {reason && (
        <p role="status" className="sr-only">
          Your pin is on the map. A verified woman nearby replies:
          “{reason.reply}”.
        </p>
      )}
      {/* Not gated on the active act: the act flips to "how" once you've
          scrolled even half a screen, which made the chips go dead right
          when they were comfortably reachable. The scene stages itself
          from the current viewport, so the pin drops wherever the camera
          is — and flies off-stage naturally when the camera travels on. */}
      {map && reason ? (
        <TryScene key={reason.id} map={map} reply={reason.reply} reduced={!!reduced} />
      ) : null}
    </div>
  );
}

/** One run of the drop → ripple → walk → reply → saved sequence. Keyed by
 * reason, so picking another chip strikes the set and replays fresh. */
function TryScene({ map, reply, reduced }: { map: MapboxMap; reply: string; reduced: boolean }) {
  const [els, setEls] = useState<{ pin: HTMLDivElement; avatar: HTMLDivElement } | null>(null);
  const avatarMarker = useRef<Marker | null>(null);
  const scene = useRef<HeroScene | null>(null);
  const [phase, setPhase] = useState<Phase>("drop");
  // visuals derive from `reduced` at render — no setState needed to pre-land
  const shown: Phase = reduced ? "saved" : phase;
  const at = (p: Phase) => PHASES.indexOf(shown) >= PHASES.indexOf(p);

  useEffect(() => {
    let cancelled = false;
    let markers: Marker[] = [];
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await cameraIdle(map);
      if (cancelled) return;
      const s = heroScene(map);
      scene.current = s;
      const pinEl = document.createElement("div");
      const avatarEl = document.createElement("div");
      const pin = new mapboxgl.Marker({ element: pinEl, anchor: "bottom" })
        .setLngLat(s.pin)
        .addTo(map);
      const avatar = new mapboxgl.Marker({ element: avatarEl, anchor: "center" })
        .setLngLat(s.avatarStart)
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
      if (scene.current) avatarMarker.current?.setLngLat(scene.current.avatarEnd);
      return;
    }

    let cancelled = false;
    let walk: ReturnType<typeof animate> | undefined;

    (async () => {
      // Snappier than the passive hero loop: you tapped and you're
      // watching, so the reply lands at ~2.4s, the glow at ~3.2s. The drop
      // itself keeps its weight — that's the signature moment (§3.3).
      await sleep(650); // spring drop lands
      if (cancelled) return;
      setPhase("ripple");
      await sleep(400);
      if (cancelled) return;
      const { avatarStart, avatarEnd } = scene.current ?? {};
      if (!avatarStart || !avatarEnd) return;
      avatarMarker.current?.setLngLat(avatarStart);
      setPhase("walk");
      walk = animate(0, 1, {
        duration: 1.3,
        ease: PIN_EASE,
        onUpdate: (t) =>
          avatarMarker.current?.setLngLat([
            avatarStart[0] + (avatarEnd[0] - avatarStart[0]) * t,
            avatarStart[1] + (avatarEnd[1] - avatarStart[1]) * t,
          ]),
      });
      await sleep(1350);
      if (cancelled) return;
      setPhase("bubble");
      await sleep(800);
      if (cancelled) return;
      setPhase("saved");
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
          {at("ripple") && !reduced && <Ripple />}
          <PinSvg drop={!reduced} glow={at("saved")} />
        </div>,
        els.pin
      )}
      {createPortal(
        <div className="relative">
          <AnimatePresence>
            {at("walk") && <AvatarDot key="dot" pop={!reduced} />}
          </AnimatePresence>
          <AnimatePresence>
            {at("bubble") && (
              <div key="bubble" className="absolute bottom-[28px] left-1/2 -translate-x-1/2">
                <motion.div
                  className="w-max rounded-full bg-paper px-3.5 py-1.5 font-ui text-xs font-semibold tracking-wide text-ink shadow-warm-lg"
                  initial={reduced ? false : { scale: 0.6, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  {reply}
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
