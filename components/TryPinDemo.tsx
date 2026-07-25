"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useStage } from "./Stage";
import { AvatarDot, PinSvg, Ripple, PIN_EASE } from "./pins";
import { cameraIdle, heroScene, pinPoint, placeOffset, type HeroScene } from "@/lib/hero-scene";
import { REASONS, type Reason } from "@/lib/reasons";

const PHASES = ["drop", "ripple", "walk", "bubble", "saved", "settle"] as const;
type Phase = (typeof PHASES)[number];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The hero demo you do yourself: say who the seat is for and the camera
 * flies to a real venue for it — Centre Court for tennis, Colbert for
 * French — where your pin drops, a woman walks over, and her reply answers
 * the reason you chose. The scene ends with a slow pull-back that reveals
 * the neighbourhood. No map taps needed, so it can't fight page scroll on
 * mobile; under reduced motion the camera cuts and the scene pre-lands.
 */
export default function TryPinDemo() {
  const { map, reason, setReason } = useStage();
  const reduced = useReducedMotion();
  // On mobile the pin drops in the strip above the headline while your
  // thumb and eyes are on the chips at the bottom — so the caption below
  // the chips carries the payoff, swapping from the venue name to her
  // reply the moment the bubble pops up on the map.
  const [replyLanded, setReplyLanded] = useState(false);

  const fly = (r: Reason) => {
    if (!map) return;
    const cam = {
      center: r.place.center,
      zoom: r.place.zoom,
      pitch: 40,
      // aim the venue at the exact viewport point the pin drops on
      offset: placeOffset(map),
    };
    if (reduced) {
      map.easeTo({ ...cam, duration: 0 });
    } else {
      // unhurried, high arc: rise over London, dive to the venue
      map.flyTo({ ...cam, speed: 0.95, curve: 1.6, maxDuration: 5500 });
    }
  };

  return (
    <div className="mt-6 max-w-md md:mt-10 short-laptop:mt-7">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.08em] text-ink/70">
        Try it — who&rsquo;s the seat for?
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
                setReplyLanded(false);
                setReason(r);
                fly(r);
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
      {/* the map layer is aria-hidden, so name the venue and (when the
          bubble lands up top) her reply here, under the thumb. One line
          that swaps content, so it never adds height below the fold. */}
      {reason && (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 min-h-[1.1rem] font-ui text-xs text-ink/70"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={replyLanded ? `reply-${reason.id}` : `venue-${reason.id}`}
              className="inline-block"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: reduced ? 0 : 0.32, ease: PIN_EASE }}
            >
              {replyLanded ? (
                <span className="font-semibold text-ink">
                  Someone nearby: &ldquo;{reason.reply}&rdquo;
                </span>
              ) : (
                <>Your pin&rsquo;s at {reason.place.name}.</>
              )}
            </motion.span>
          </AnimatePresence>
        </p>
      )}
      {/* Not gated on the active act: the act flips to "how" once you've
          scrolled even half a screen, which made the chips go dead right
          when they were comfortably reachable. The scene waits for the
          camera to reach its venue before dropping the pin — even if that
          arrival is a later scroll back up to the hero. */}
      {map && reason ? (
        <TryScene
          key={reason.id}
          map={map}
          reason={reason}
          reduced={!!reduced}
          onReplyLanded={() => setReplyLanded(true)}
        />
      ) : null}
    </div>
  );
}

/** One run of the fly → drop → ripple → walk → reply → saved → pull-back
 * sequence. Keyed by reason, so picking another chip strikes the set and
 * replays fresh at the new venue. */
function TryScene({
  map,
  reason,
  reduced,
  onReplyLanded,
}: {
  map: MapboxMap;
  reason: Reason;
  reduced: boolean;
  onReplyLanded: () => void;
}) {
  const { act } = useStage();
  const [els, setEls] = useState<{ pin: HTMLDivElement; avatar: HTMLDivElement } | null>(null);
  const avatarMarker = useRef<Marker | null>(null);
  const scene = useRef<HeroScene | null>(null);
  const [phase, setPhase] = useState<Phase>("drop");
  const actNow = useRef(act);
  actNow.current = act;
  // read the latest callback without it re-triggering the scene effect
  const onReplyRef = useRef(onReplyLanded);
  onReplyRef.current = onReplyLanded;
  // visuals derive from `reduced` at render — no setState needed to pre-land
  const shown: Phase = reduced ? "saved" : phase;
  const at = (p: Phase) => PHASES.indexOf(shown) >= PHASES.indexOf(p);

  useEffect(() => {
    let cancelled = false;
    let markers: Marker[] = [];
    let moveHandler: (() => void) | undefined;
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      const venue = mapboxgl.LngLat.convert(reason.place.center);
      // the pin belongs at the venue: hold the curtain until the flight
      // lands (or, if scrolling interrupted it, until the hero's next
      // return trip brings the camera back to this framing)
      const arrived = () => {
        const { clientWidth: w, clientHeight: h } = map.getContainer();
        return map.unproject(pinPoint(w, h)).distanceTo(venue) < 250;
      };
      await cameraIdle(map);
      while (!cancelled && !arrived()) {
        await new Promise<void>((r) => {
          moveHandler = () => r();
          map.once("moveend", moveHandler);
        });
        moveHandler = undefined;
      }
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
      if (moveHandler) map.off("moveend", moveHandler);
      markers.forEach((m) => m.remove());
    };
  }, [map, reason]);

  useEffect(() => {
    if (!els) return;

    if (reduced) {
      // pre-landed scene; visuals derive from `reduced` at render
      if (scene.current) avatarMarker.current?.setLngLat(scene.current.avatarEnd);
      onReplyRef.current();
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
      onReplyRef.current(); // her reply also lands in the caption, under the thumb
      await sleep(800);
      if (cancelled) return;
      setPhase("saved");
      // Curtain call: once the reply has been read, the bubble bows out and
      // the camera pulls back around the pin — same screen spot, wider
      // neighbourhood — so the scene ends on "your seat, saved, at a real
      // place". Skipped if she's already scrolled on.
      await sleep(1500);
      if (cancelled || actNow.current !== "hero" || map.isMoving() || !scene.current) return;
      setPhase("settle");
      map.easeTo({
        zoom: reason.place.zoom - 0.75,
        around: scene.current.pin,
        duration: 2600,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    })();

    return () => {
      cancelled = true;
      walk?.stop();
    };
  }, [els, reduced, map, reason]);

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
            {at("bubble") && !at("settle") && (
              <div key="bubble" className="absolute bottom-[28px] left-1/2 -translate-x-1/2">
                <motion.div
                  className="w-max rounded-full bg-paper px-3.5 py-1.5 font-ui text-xs font-semibold tracking-wide text-ink shadow-warm-lg"
                  initial={reduced ? false : { scale: 0.6, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  {reason.reply}
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
