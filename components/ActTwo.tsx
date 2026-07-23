"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import type { Map as MapboxMap, Marker } from "mapbox-gl";
import { useStage } from "./Stage";
import { AvatarDot, PinSvg, PIN_EASE } from "./pins";
import Reveal from "./Reveal";

// The three vibes, staged around Covent Garden (§4 Act II).
const VIBE_PINS = [
  { lngLat: [-0.122, 51.5129] as [number, number], color: "var(--houselight)", label: "Chatty" },
  { lngLat: [-0.1232, 51.5107] as [number, number], color: "var(--sage)", label: "Low-key" },
  { lngLat: [-0.1199, 51.5117] as [number, number], color: "var(--velvet)", label: "Spare ticket" },
];
const AVATAR_START: [number, number] = [-0.1245, 51.5096];
const AVATAR_END: [number, number] = [-0.1194, 51.5113];

const STEPS = [
  {
    title: "Drop a pin",
    body: "Public places only. Pick your vibe so she knows what she's walking into:",
    vibes: true,
  },
  {
    title: "Someone says “on my way”",
    body: "Verified women nearby see your pin. You choose who takes the seat.",
    vibes: false,
  },
  {
    title: "Company, on your terms",
    body: "Chat in the app, meet in the open. The pin closes when you’re happy.",
    vibes: false,
  },
];

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Act II: three steps that each sync a map event. On desktop the steps are
 * a vertical scroll sequence; on mobile the story is tap-through — a Next
 * button advances it, scroll is never hijacked (§3.4).
 */
export default function ActTwo() {
  const { map, act } = useStage();
  const [step, setStep] = useState(0);
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  );

  // desktop: the step whose card crosses mid-viewport drives the scene
  useEffect(() => {
    if (isMobile) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number(entry.target.getAttribute("data-step"));
          if (!Number.isNaN(i)) setStep(i);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <>
      {map && act === "how" ? <CoventScene map={map} step={step} /> : null}

      <Reveal className="max-w-md">
        <div className="rounded-2xl bg-paper/95 p-8 shadow-warm-lg md:p-10">
          <p className="eyebrow text-velvet">Act II — How it works</p>
          <h2 className="display mt-4 text-4xl md:text-5xl">
            Drop a pin. Company comes to you.
          </h2>
        </div>
      </Reveal>

      {isMobile ? (
        <div className="mt-8 max-w-md">
          <div className="rounded-2xl bg-paper/95 p-8 shadow-warm">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: PIN_EASE }}
              >
                <StepBody i={step} />
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2" aria-hidden>
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i === step ? "bg-velvet" : "bg-ink/20"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) % STEPS.length)}
                className="rounded-full bg-velvet px-5 py-2.5 font-ui text-xs font-semibold uppercase tracking-[0.08em] text-paper active:scale-[0.97]"
              >
                {step === STEPS.length - 1 ? "Start again" : "Next"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ol className="mt-8 max-w-md list-none space-y-8">
          {STEPS.map((s, i) => (
            <li key={s.title} data-step={i}>
              <Reveal delay={i * 0.08} className="rounded-2xl bg-paper/95 p-8 shadow-warm">
                <StepBody i={i} />
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function StepBody({ i }: { i: number }) {
  const s = STEPS[i];
  return (
    <>
      <h3 className="display text-2xl">
        {i + 1}. {s.title}
      </h3>
      <p className="mt-3">{s.body}</p>
      {s.vibes && (
        <ul className="mt-4 space-y-2.5">
          {[
            { color: "var(--houselight)", name: "Chatty", meaning: "talk to me, please" },
            { color: "var(--sage)", name: "Low-key", meaning: "company, quietly" },
            { color: "var(--velvet)", name: "Spare ticket", meaning: "the seat next to me is going" },
          ].map((v) => (
            <li key={v.name} className="flex items-baseline gap-3">
              <span
                aria-hidden
                className="inline-block h-3 w-3 shrink-0 translate-y-px rounded-full"
                style={{ background: v.color }}
              />
              <span>
                <span className="font-ui text-sm font-semibold uppercase tracking-wide">
                  {v.name}
                </span>{" "}
                <span className="text-ink/75">{v.meaning}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** The Covent Garden cast: vibe pins on step 1, the walk on step 2,
 * seat saved on step 3. */
function CoventScene({ map, step }: { map: MapboxMap; step: number }) {
  const reduced = useReducedMotion();
  const [els, setEls] = useState<{ pins: HTMLDivElement[]; avatar: HTMLDivElement } | null>(null);
  const avatarMarker = useRef<Marker | null>(null);

  useEffect(() => {
    let cancelled = false;
    const markers: Marker[] = [];
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled) return;
      const pinEls = VIBE_PINS.map((p) => {
        const el = document.createElement("div");
        markers.push(
          new mapboxgl.Marker({ element: el, anchor: "bottom" }).setLngLat(p.lngLat).addTo(map)
        );
        return el;
      });
      const avatarEl = document.createElement("div");
      const avatar = new mapboxgl.Marker({ element: avatarEl, anchor: "center" })
        .setLngLat(AVATAR_START)
        .addTo(map);
      avatarMarker.current = avatar;
      markers.push(avatar);
      setEls({ pins: pinEls, avatar: avatarEl });
    })();
    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
    };
  }, [map]);

  // step 2: she walks over to the spare-ticket pin
  useEffect(() => {
    if (!els || step < 1) return;
    if (reduced) {
      avatarMarker.current?.setLngLat(AVATAR_END);
      return;
    }
    avatarMarker.current?.setLngLat(AVATAR_START);
    const walk = animate(0, 1, {
      duration: 1.8,
      ease: PIN_EASE,
      onUpdate: (t) =>
        avatarMarker.current?.setLngLat([
          AVATAR_START[0] + (AVATAR_END[0] - AVATAR_START[0]) * t,
          AVATAR_START[1] + (AVATAR_END[1] - AVATAR_START[1]) * t,
        ]),
    });
    return () => walk.stop();
  }, [els, step >= 1, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!els) return null;

  return (
    <>
      {els.pins.map((el, i) =>
        createPortal(
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {(step >= 0 || reduced) && (
                <motion.div
                  key="chip"
                  className="mb-1 w-max rounded-full bg-paper/95 px-2 py-0.5 font-ui text-[10px] font-semibold uppercase tracking-wide text-ink shadow-warm"
                  initial={reduced ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: reduced ? 0 : 0.35 * i + 0.5 }}
                >
                  {VIBE_PINS[i].label}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Chanel rule: no second ripple — that flourish belongs to the
                hero pin alone (§3.3) */}
            <PinSvg
              color={VIBE_PINS[i].color}
              size={30}
              drop={!reduced}
              glow={step >= 2 && i === 2}
            />
          </div>,
          el,
          `vibe-pin-${i}`
        )
      )}
      {createPortal(
        <AnimatePresence>
          {(step >= 1 || reduced) && <AvatarDot key="dot" pop={!reduced} />}
        </AnimatePresence>,
        els.avatar
      )}
    </>
  );
}
