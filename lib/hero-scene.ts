import type { Map as MapboxMap } from "mapbox-gl";

export type HeroScene = {
  pin: [number, number];
  avatarStart: [number, number];
  avatarEnd: [number, number];
};

/**
 * Stage positions for the hero pin-drop, derived from the viewport so the
 * scene always plays on-screen. Fixed Soho coordinates put the whole cast
 * off the right edge on phones. Desktop: clear of the copy on the left
 * third (matches the original Soho Square staging). Mobile: in the open
 * map above the headline, with the walk scaled down to fit.
 */
export function heroScene(map: MapboxMap): HeroScene {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const mobile = w < 768;
  // mobile offsets keep the bubble (which pops above the avatar) clear of
  // the pin, so the signature teardrop stays fully visible
  const pin: [number, number] = mobile ? [w * 0.6, h * 0.11] : [w * 0.7, h * 0.42];
  const startOff = mobile ? [-120, 20] : [-150, 138];
  const endOff = mobile ? [49, 55] : [49, 37];
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
