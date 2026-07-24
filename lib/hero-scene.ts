import type { Map as MapboxMap } from "mapbox-gl";

export type HeroScene = {
  pin: [number, number];
  avatarStart: [number, number];
  avatarEnd: [number, number];
};

/**
 * Where the hero pin sits in the viewport. The mobile hero is text-dense;
 * the only clear map is the strip above the eyebrow. Keep the whole cast —
 * pin, avatar, and the bubble that pops above it — high enough that the
 * bubble clears the eyebrow line, and the pin far enough down that its top
 * isn't clipped. Desktop: clear of the copy on the left third.
 */
export function pinPoint(w: number, h: number): [number, number] {
  return w < 768 ? [w * 0.64, h * 0.085] : [w * 0.7, h * 0.42];
}

/**
 * flyTo offset that lands a target lng/lat exactly under the pin point, so
 * a chip's venue sits beneath the pin that's about to drop on it.
 */
export function placeOffset(map: MapboxMap): [number, number] {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const [x, y] = pinPoint(w, h);
  return [x - w / 2, y - h / 2];
}

/**
 * Stage positions for the hero pin-drop, derived from the viewport so the
 * scene always plays on-screen. Fixed Soho coordinates put the whole cast
 * off the right edge on phones. Call only once the camera is idle.
 */
export function heroScene(map: MapboxMap): HeroScene {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const mobile = w < 768;
  const pin = pinPoint(w, h);
  const startOff = mobile ? [-108, 8] : [-150, 138];
  const endOff = mobile ? [42, 34] : [49, 37];
  const to = ([x, y]: [number, number]): [number, number] => {
    const p = map.unproject([x, y]);
    return [p.lng, p.lat];
  };
  return {
    pin: to(pin),
    avatarStart: to([pin[0] + startOff[0], pin[1] + startOff[1]]),
    avatarEnd: to([pin[0] + endOff[0], pin[1] + endOff[1]]),
  };
}

/** Resolves once the camera is still — staging while a flyTo is in flight
 * would anchor the scene to wherever the flight happened to be. */
export function cameraIdle(map: MapboxMap): Promise<void> {
  return new Promise((r) => (map.isMoving() ? map.once("moveend", () => r()) : r()));
}
