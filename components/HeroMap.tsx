"use client";

import { useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import MapStage from "./MapStage";
import HeroPinDemo from "./HeroPinDemo";

export default function HeroMap() {
  const [map, setMap] = useState<MapboxMap | null>(null);
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <MapStage className="absolute inset-0" onReady={(m) => setMap(m)} />
      {map ? <HeroPinDemo map={map} /> : null}
    </div>
  );
}
