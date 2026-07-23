"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { applyTheatreStyle, WAYPOINTS } from "@/lib/map-theatre";

type Status = "loading" | "ready" | "failed";

/**
 * The single shared map instance (§5.2): lazy-inited on the client,
 * non-interactive, restyled to the palette on load. Shows the blush grain
 * placeholder until tiles are in, and a static styled image of London if
 * the token is missing, the style fails, or WebGL gives up — never a grey box.
 */
export default function MapStage({
  onReady,
  className,
}: {
  onReady?: (map: MapboxMap) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [status, setStatus] = useState<Status>(token ? "loading" : "failed");
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    if (!token) return;

    let map: MapboxMap | undefined;
    let cancelled = false;

    (async () => {
      // let the page paint and fonts land before mapbox's chunk competes
      // for bandwidth and main thread — the blush placeholder is the
      // designed loading state (§5.2)
      await new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve(), { once: true });
      });
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(() => resolve(), { timeout: 1500 });
        } else {
          setTimeout(resolve, 500);
        }
      });
      if (cancelled) return;
      const mapboxgl = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = token;

      // In dev, effects can fire before global CSS lands and the section is
      // still 0-tall; Mapbox would size its canvas to a 300px fallback.
      for (let i = 0; i < 60 && containerRef.current.clientHeight === 0; i++) {
        await new Promise(requestAnimationFrame);
      }
      if (cancelled || !containerRef.current) return;

      let loaded = false;
      try {
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: WAYPOINTS.hero.center,
          zoom: WAYPOINTS.hero.zoom,
          pitch: WAYPOINTS.hero.pitch,
          interactive: false,
          attributionControl: false,
        });
      } catch {
        setStatus("failed");
        return;
      }

      map.addControl(new mapboxgl.AttributionControl({ compact: true }));

      map.on("load", () => {
        if (cancelled || !map) return;
        loaded = true;
        applyTheatreStyle(map);
        map.resize();
        setStatus("ready");
        onReadyRef.current?.(map);
      });

      // Transient tile errors are normal; only fail if the style itself
      // never comes up (bad token, network down).
      map.on("error", (e) => {
        const status = (e.error as { status?: number } | undefined)?.status;
        if (!loaded && (status === 401 || status === 403)) {
          setStatus("failed");
        }
      });

      map.getCanvas().addEventListener("webglcontextlost", () => {
        setStatus("failed");
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [token]);

  return (
    <div className={className} data-map-stage aria-hidden="true">
      <div className="absolute inset-0 bg-blush">
        <div className="grain absolute inset-0 opacity-[0.05] mix-blend-multiply" />
      </div>
      {status === "failed" ? (
        <>
          <Image
            src="/map-fallback.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <p className="absolute bottom-1 right-2 font-ui text-[10px] text-ink/65">
            © Mapbox © OpenStreetMap
          </p>
        </>
      ) : (
        // Mapbox owns the inner div's classes; keep React's transition styling
        // on a wrapper so re-renders don't clobber them.
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            status === "ready" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* sized, not positioned: mapbox's own .mapboxgl-map css forces
              position:relative, which would zero out an inset-based size */}
          <div ref={containerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
