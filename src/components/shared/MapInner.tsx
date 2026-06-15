"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Station, METRO_LINES, STATIONS, LINE_ROUTES } from "../../lib/metroData";
import { StationReport, Language } from "../../types";
import { LocateFixed } from "lucide-react";

interface MapInnerProps {
  stations: Station[];
  activeReports: StationReport[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  selectedLines: string[];
  selectedSystems: string[];
  selectedWarnings: string[];
  language: Language;
  isAdmin?: boolean;
}

// Helper component to center map when selectedStationId changes
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

// Helper component to center map on user location
function MapController({
  userLocation,
  shouldCenterUser,
  setShouldCenterUser,
}: {
  userLocation: [number, number] | null;
  shouldCenterUser: boolean;
  setShouldCenterUser: (v: boolean) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (shouldCenterUser && userLocation) {
      map.setView(userLocation, 15, { animate: true });
      setShouldCenterUser(false);
    }
  }, [shouldCenterUser, userLocation, map, setShouldCenterUser]);
  return null;
}

// Helper component to listen to map zoom changes
function MapEvents({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

interface IconSizeConfig {
  dotSizePx: number;
  pulseSizePx: number;
  selectSizePx: number;
  showLabel: boolean;
  labelSizeClass: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  labelOffsetPx: number;
}

const getIconSizeConfig = (zoom: number, isSelected: boolean): IconSizeConfig => {
  if (zoom <= 11) {
    return {
      dotSizePx: 8,
      pulseSizePx: 16,
      selectSizePx: 14,
      showLabel: isSelected,
      labelSizeClass: "text-[8px]",
      labelOffsetPx: 16,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    };
  }
  if (zoom === 12) {
    return {
      dotSizePx: 10,
      pulseSizePx: 20,
      selectSizePx: 18,
      showLabel: isSelected,
      labelSizeClass: "text-[8px]",
      labelOffsetPx: 20,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    };
  }
  if (zoom === 13) {
    return {
      dotSizePx: 12,
      pulseSizePx: 24,
      selectSizePx: 22,
      showLabel: true,
      labelSizeClass: "text-[8px]",
      labelOffsetPx: 22,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    };
  }
  if (zoom === 14) {
    return {
      dotSizePx: 16,
      pulseSizePx: 36,
      selectSizePx: 30,
      showLabel: true,
      labelSizeClass: "text-[9px]",
      labelOffsetPx: 24,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    };
  }
  return {
    dotSizePx: 20,
    pulseSizePx: 44,
    selectSizePx: 38,
    showLabel: true,
    labelSizeClass: "text-[10px]",
    labelOffsetPx: 28,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  };
};

export default function MapInner({
  stations,
  activeReports,
  selectedStationId,
  onSelectStation,
  selectedLines,
  selectedSystems,
  selectedWarnings,
  language,
  isAdmin = false,
}: MapInnerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shouldCenterUser, setShouldCenterUser] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(13);

  // Step 1: memoize ONLY the data that changes when reports/selection change.
  // This does NOT depend on zoom — avoids re-computing colors on every zoom.
  const stationIconData = useMemo(() => {
    return stations.map((station) => {
      const stationAlerts = activeReports.filter(r => r.station_id === station.id);
      const hasAlert = stationAlerts.length > 0 && !stationAlerts.some(a => a.type === "lliure");
      const primaryLineId = station.lines[0];
      const lineColor = METRO_LINES[primaryLineId]?.color || "#3b82f6";
      const isSelected = selectedStationId === station.id;

      let alertColor = "rgba(239, 68, 68, 0.5)";
      let alertBorderColor = "#ef4444";

      if (hasAlert) {
        const alertType = stationAlerts[0].type;
        if (alertType === "lliure") {
          alertColor = "rgba(34, 197, 94, 0.5)";
          alertBorderColor = "#22c55e";
        } else if (alertType === "delay" || alertType === "pregunta") {
          alertColor = "rgba(245, 158, 11, 0.5)";
          alertBorderColor = "#f59e0b";
        } else if (alertType === "closed") {
          alertColor = "rgba(239, 68, 68, 0.6)";
          alertBorderColor = "#ef4444";
        }
      }

      return { station, hasAlert, lineColor, isSelected, alertColor, alertBorderColor };
    });
  }, [stations, activeReports, selectedStationId]); // ← NO zoom here

  // Step 2: Convert data to Leaflet DivIcons. Only re-runs when zoom OR data changes.
  const stationIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};

    stationIconData.forEach(({ station, hasAlert, lineColor, isSelected, alertColor, alertBorderColor }) => {
      const cfg = getIconSizeConfig(zoom, isSelected);

      const htmlString = `
        <div class="relative flex items-center justify-center" style="width:${cfg.iconSize[0] + 16}px; height:${cfg.iconSize[1] + 16}px;">
          <!-- Transparent hit-area enlarger for easier tapping -->
          <div class="absolute inset-0 rounded-full"></div>

          <!-- Pulsing alert ring if station has active reports -->
          ${
            hasAlert
              ? `<div class="absolute rounded-full animate-alert-pulse" style="width: ${cfg.pulseSizePx}px; height: ${cfg.pulseSizePx}px; background: ${alertColor}; border: 1.5px solid ${alertBorderColor};"></div>`
              : ""
          }

          <!-- Selection glow ring (same color as line) -->
          ${
            isSelected
              ? `<div class="absolute rounded-full" style="width: ${cfg.selectSizePx}px; height: ${cfg.selectSizePx}px; border: 2px solid ${lineColor}; opacity: 0.6; box-shadow: 0 0 0 2px ${lineColor}30;"></div>`
              : ""
          }

          <!-- Core station dot — minimal solid disc -->
          <div class="z-10 rounded-full shadow-md transition-all duration-200 ${
            isSelected ? "scale-125" : ""
          }" style="width: ${cfg.dotSizePx}px; height: ${cfg.dotSizePx}px; background-color: ${lineColor}; box-shadow: 0 1px 4px ${lineColor}60;"></div>

          <!-- Station label -->
          ${
            cfg.showLabel
              ? `<div class="absolute whitespace-nowrap bg-[#09090b]/85 border border-[#18181b] px-1.5 py-0.5 rounded ${cfg.labelSizeClass} font-bold text-[#f4f4f5] pointer-events-none shadow-md" style="left: ${cfg.labelOffsetPx + 6}px;">
                  ${station.name}
                </div>`
              : ""
          }
        </div>
      `;

      icons[station.id] = L.divIcon({
        className: `custom-station-icon-${station.id}`,
        html: htmlString,
        iconSize: [cfg.iconSize[0] + 16, cfg.iconSize[1] + 16] as [number, number],
        iconAnchor: [(cfg.iconAnchor[0] + 8), (cfg.iconAnchor[1] + 8)] as [number, number],
      });
    });

    return icons;
  }, [stationIconData, zoom]); // ← depends on processed data + zoom only

  // Memoize polyline routes using exact segments defined in LINE_ROUTES
  const polylines = useMemo(() => {
    return Object.entries(METRO_LINES).flatMap(([lineId, line]) => {
      // Filter by selectedSystems
      if (!selectedSystems.includes(line.type)) return [];

      // Filter by selectedLines
      if (!selectedLines.includes(lineId)) return [];

      const segments = LINE_ROUTES[lineId];
      if (!segments || segments.length === 0) return [];

      return segments.map((segment, index) => {
        const coords: [number, number][] = segment
          .map(stationId => {
            const station = STATIONS.find(s => s.id === stationId);
            return station ? [station.lat, station.lng] : null;
          })
          .filter((coord): coord is [number, number] => coord !== null);

        if (coords.length < 2) return null;

        return {
          key: `${lineId}-${index}`,
          lineId,
          color: line.color,
          type: line.type,
          coords
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null);
    });
  }, [selectedLines, selectedSystems]);


  // Memoize user location icon to avoid recreation
  const userLocationIcon = useMemo(() => {
    const htmlString = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 animate-ping" style="animation-duration: 3s;"></div>
        <div class="absolute w-5 h-5 rounded-full bg-blue-500/25"></div>
        <div class="z-20 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-md"></div>
      </div>
    `;
    return L.divIcon({
      className: "user-location-icon",
      html: htmlString,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        // code 1 = PERMISSION_DENIED — expected if user declined, no need to warn
        if (error.code === 1) return;
        // code 2 = POSITION_UNAVAILABLE, code 3 = TIMEOUT — log cleanly
        console.warn(`Geolocation error (code ${error.code}): ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Filter stations based on smart selection
  const filteredStations = stations.filter(station => {
    // 1. System Filter (metro / rodalies)
    const matchesSystem = selectedSystems.includes(station.type) || 
      (station.type === "both" && (selectedSystems.includes("metro") || selectedSystems.includes("rodalies")));
    if (!matchesSystem) return false;

    // 2. Line Filter
    const matchesLine = station.lines.some(l => selectedLines.includes(l));
    if (!matchesLine) return false;

    // 3. Warning Filter (if warning filter is active)
    if (selectedWarnings.length > 0) {
      const hasMatchingWarning = activeReports.some(r => r.station_id === station.id && selectedWarnings.includes(r.type));
      if (!hasMatchingWarning) return false;
    }

    return true;
  });

  // Default center: Catalunya
  const centerPosition: [number, number] = [41.3870, 2.1700];

  // If a station is selected, center on it
  const selectedStation = stations.find(s => s.id === selectedStationId);
  const mapCenter: [number, number] = selectedStation
    ? [selectedStation.lat, selectedStation.lng]
    : centerPosition;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        zoomControl={false}
        attributionControl={false} // Hides the attribution at the bottom
        style={{ width: "100%", height: "100%" }}
        maxZoom={18}
        minZoom={9}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Listen to zoom events */}
        <MapEvents onZoomChange={setZoom} />

        {/* Route polylines — drawn below station markers */}
        {polylines.map(({ key, lineId, color, type, coords }) => (
          <Polyline
            key={key}
            positions={coords}
            pathOptions={{
              color,
              weight: type === "metro" ? 2 : 1.5,
              opacity: 0.5,
              dashArray: type === "rodalies" ? "5 4" : undefined,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ))}

        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={stationIcons[station.id]}
            eventHandlers={{
              click: () => onSelectStation(station.id),
            }}
          />
        ))}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={userLocationIcon}
          />
        )}

        {userLocation && (
          <MapController
            userLocation={userLocation}
            shouldCenterUser={shouldCenterUser}
            setShouldCenterUser={setShouldCenterUser}
          />
        )}

        {selectedStationId && selectedStation && (
          <ChangeMapView center={[selectedStation.lat, selectedStation.lng]} />
        )}
      </MapContainer>

      {/* Floating Geolocation Centering Button */}
      <button
        onClick={() => {
          if (userLocation) {
            setShouldCenterUser(true);
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                setUserLocation(loc);
                setShouldCenterUser(true);
              },
              (err) => {
                console.error(err);
                setGpsError(
                  language === "ru"
                    ? "Не удалось получить геопозицию. Пожалуйста, разрешите доступ к геопозиции в настройках браузера и устройства."
                    : language === "es"
                    ? "No se pudo obtener la ubicación. Por favor, permite el acceso a la ubicación en los ajustes del navegador y dispositivo."
                    : language === "fr"
                    ? "Impossible d'obtenir la position. Veuillez autoriser l'accès dans les paramètres du navigateur et de l'appareil."
                    : "Could not obtain location. Please enable location access in your browser and device settings."
                );
                setTimeout(() => setGpsError(null), 3500);
              }
            );
          }
        }}
        className={`absolute right-4 z-[900] h-12 w-12 rounded-full bg-[#09090b]/90 border border-[#1c1c1f]/80 text-[#71717a] hover:text-white shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200 ${
          isAdmin ? "bottom-40" : "bottom-24"
        }`}
        title="Center on my location"
        aria-label="Locate me"
        style={{ minHeight: "44px", minWidth: "44px" }}
      >
        <LocateFixed size={20} className={userLocation ? "text-blue-500" : "text-zinc-500"} />
      </button>

      {/* Floating GPS Error Toast */}
      {gpsError && (
        <div className="absolute top-16 left-4 right-4 z-[999] bg-red-950/80 border border-red-500/30 text-red-200 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md text-center animate-in fade-in slide-in-from-top duration-300">
          {gpsError}
        </div>
      )}
    </div>
  );
}
