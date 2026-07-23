import type { Map as MapboxMap } from "mapbox-gl";

// Camera waypoints (§5.2). Hero centre sits west of Soho Square so the
// pin-drop demo lands clear of the copy on the left third.
export const WAYPOINTS = {
  hero: { center: [-0.1405, 51.5138] as [number, number], zoom: 14.5, pitch: 40 },
  coventGarden: { center: [-0.1229, 51.5117] as [number, number], zoom: 15, pitch: 40 },
  southBank: { center: [-0.116, 51.5066] as [number, number], zoom: 14.8, pitch: 45 },
  albertHall: { center: [-0.1774, 51.5009] as [number, number], zoom: 15, pitch: 40 },
  wideLondon: { center: [-0.1278, 51.5074] as [number, number], zoom: 11.5, pitch: 0 },
};

// Map-only tints derived from the brand tokens: land is oat so minor roads
// read ivory-on-oat, parks are a desaturated sage wash, water is blush (§5.1).
const C = {
  paper: "#FBF6EE",
  ink: "#2E2128",
  blush: "#EFDFD7",
  land: "#F8F1E3",
  ivory: "#FFFCF5",
  roadCase: "#EDE3CF",
  park: "#DFE2D2",
  building: "#F2E9D9",
};

/**
 * Repaint mapbox/light-v11 at runtime so the map looks printed in the
 * programme rather than embedded (§5.1). Pattern-matches layer ids so a
 * minor style-version bump degrades gracefully instead of throwing.
 */
export function applyTheatreStyle(map: MapboxMap) {
  const paint = map as unknown as {
    setPaintProperty(id: string, prop: string, value: unknown): void;
    setLayoutProperty(id: string, prop: string, value: unknown): void;
  };
  const layers = map.getStyle()?.layers ?? [];

  for (const layer of layers) {
    const { id, type } = layer;
    const set = (prop: string, value: unknown) => {
      try {
        paint.setPaintProperty(id, prop, value);
      } catch {
        // layer lacks this paint property — fine
      }
    };
    const hide = () => {
      try {
        paint.setLayoutProperty(id, "visibility", "none");
      } catch {
        // ignore
      }
    };

    if (type === "background") {
      set("background-color", C.paper);
    } else if (type === "hillshade" || type === "fill-extrusion" || type === "circle") {
      hide();
    } else if (type === "fill") {
      if (/water/.test(id)) {
        set("fill-color", C.blush);
      } else if (/park|grass|pitch|golf|garden|cemetery|landcover|national-park|scrub|wood/.test(id)) {
        set("fill-color", C.park);
      } else if (/building/.test(id)) {
        set("fill-color", C.building);
        set("fill-opacity", 0.7);
        set("fill-outline-color", C.roadCase);
      } else {
        set("fill-color", C.land);
      }
    } else if (type === "line") {
      if (/road|bridge|tunnel/.test(id)) {
        if (/case/.test(id)) {
          set("line-color", C.roadCase);
        } else if (/motorway|trunk|primary/.test(id)) {
          set("line-color", C.ink);
          set("line-opacity", 0.14);
        } else if (/secondary|tertiary/.test(id)) {
          set("line-color", C.ink);
          set("line-opacity", 0.09);
        } else {
          set("line-color", C.ivory);
        }
      } else if (/admin/.test(id)) {
        set("line-color", C.ink);
        set("line-opacity", 0.08);
      } else {
        set("line-color", C.roadCase);
        set("line-opacity", 0.5);
      }
    } else if (type === "symbol") {
      if (/shield/.test(id)) {
        hide();
      } else {
        set("icon-opacity", 0);
        set("text-color", C.ink);
        set("text-opacity", 0.6);
        set("text-halo-color", C.paper);
      }
    }
  }
}
