"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { Station, METRO_LINES } from "../../lib/metroData";
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

export default function MapInner({
  stations,
  activeReports,
  selectedStationId,
  onSelectStation,
  selectedLines,
  selectedSystems,
  selectedWarnings,
  language
}: MapInnerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shouldCenterUser, setShouldCenterUser] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn("Geolocation watch error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

  // Create custom icon for each station
  const createStationIcon = (station: Station) => {
    const stationAlerts = activeReports.filter(r => r.station_id === station.id);
    const hasAlert = stationAlerts.length > 0;
    
    // Get primary line color
    const primaryLineId = station.lines[0];
    const lineColor = METRO_LINES[primaryLineId]?.color || "#3b82f6";
    const isSelected = selectedStationId === station.id;

    // Define colors for alert types
    let alertColor = "rgba(239, 68, 68, 0.5)"; // red default
    let alertBorderColor = "#ef4444";

    if (hasAlert) {
      // Find highest priority alert type
      const alertType = stationAlerts[0].type;
      if (alertType === "lliure") {
        alertColor = "rgba(34, 197, 94, 0.5)"; // green for lliure (safe)
        alertBorderColor = "#22c55e";
      } else if (alertType === "delay" || alertType === "pregunta") {
        alertColor = "rgba(245, 158, 11, 0.5)"; // amber for delay/pregunta
        alertBorderColor = "#f59e0b";
      } else if (alertType === "crowd") {
        alertColor = "rgba(6, 182, 212, 0.5)"; // cyan for crowd
        alertBorderColor = "#06b6d4";
      }
    }

    const htmlString = `
      <div class="relative flex items-center justify-center">
        <!-- Pulsing alert ring if station has active reports -->
        ${
          hasAlert
            ? `<div class="absolute w-10 h-10 rounded-full animate-alert-pulse" style="background: ${alertColor}; border: 1px solid ${alertBorderColor};"></div>`
            : ""
        }
        
        <!-- Selection ring -->
        ${
          isSelected
            ? `<div class="absolute w-8 h-8 rounded-full border-2 border-dashed border-white animate-spin" style="animation-duration: 6s;"></div>`
            : ""
        }

        <!-- Core station dot -->
        <div class="z-10 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 ${
          isSelected ? "scale-125" : ""
        }" style="background-color: ${lineColor};">
          <div class="w-1 h-1 rounded-full bg-white"></div>
        </div>

        <!-- Station label -->
        <div class="absolute left-6 whitespace-nowrap bg-[#09090b]/85 border border-[#18181b] px-1.5 py-0.5 rounded text-[9px] font-bold text-[#f4f4f5] pointer-events-none shadow-md">
          ${station.name}
        </div>
      </div>
    `;

    return L.divIcon({
      className: "custom-station-icon",
      html: htmlString,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createUserLocationIcon = () => {
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
  };

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

        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={createStationIcon(station)}
            eventHandlers={{
              click: () => onSelectStation(station.id),
            }}
          />
        ))}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
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
        className="absolute bottom-36 right-4 z-[900] h-12 w-12 rounded-full bg-[#09090b]/90 border border-[#1c1c1f]/80 text-[#71717a] hover:text-white shadow-lg flex items-center justify-center active:scale-90 transition-all duration-200"
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
