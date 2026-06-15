"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Station } from "../../lib/metroData";
import { StationReport, Language } from "../../types";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#09090b] flex flex-col items-center justify-center text-sm text-[#71717a]">
      <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-2"></div>
      <span>Загрузка карты метро...</span>
    </div>
  )
});

interface MapProps {
  stations: Station[];
  activeReports: StationReport[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  selectedLines: string[];
  selectedSystems: string[];
  selectedWarnings: string[];
  language: Language;
  isAdmin?: boolean;
  mapLayer?: "all" | "metro" | "rodalies" | "none";
}

export default function Map(props: MapProps) {
  return (
    <div className="w-full h-full overflow-hidden relative">
      <MapInner {...props} />
    </div>
  );
}
