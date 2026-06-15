"use client";

import { Heart, ShieldAlert, MapPin, Accessibility } from "lucide-react";
import { STATIONS, METRO_LINES } from "../../lib/metroData";
import { TRANSLATIONS } from "../../lib/translations";
import { StationReport, Language } from "../../types";

interface FavoritesViewProps {
  favoriteIds: string[];
  activeReports: StationReport[];
  onSelectStation: (stationId: string) => void;
  onToggleFavorite: (stationId: string) => void;
  language: Language;
}

export default function FavoritesView({
  favoriteIds,
  activeReports,
  onSelectStation,
  onToggleFavorite,
  language
}: FavoritesViewProps) {
  // Get favorited station details
  const favoriteStations = STATIONS.filter(s => favoriteIds.includes(s.id));

  const t = TRANSLATIONS[language];
  const tf = t; // alias — used for tf.favorites.* keys


  const getAlertText = (stationId: string) => {
    const alerts = activeReports.filter(r => r.station_id === stationId);
    if (alerts.length === 0) return null;
    
    const types = alerts.map(a => a.type);
    
    // Check ticket control subtypes
    if (types.some(t => ["gossos", "pregunta", "gorilles", "lliure"].includes(t))) {
      const controlType = types.find(t => ["gossos", "pregunta", "gorilles", "lliure"].includes(t));
      if (controlType === "lliure") return tf.favorites.clear2;
      return tf.favorites.ticketCheck;
    }
    if (types.includes("delay")) return tf.favorites.delay;
    if (types.includes("closed")) return tf.favorites.closed;
    return tf.station.activeAlerts;
  };

  return (
    <div className="flex-1 flex flex-col p-4 no-scrollbar overflow-y-auto">
      {/* Title */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-extrabold text-white tracking-tight">{t.tabs.favorites}</h2>
        <p className="text-xs text-[#71717a] mt-0.5">
          {tf.favorites.emptyHint}
        </p>
      </div>

      {favoriteStations.length > 0 ? (
        <div className="space-y-2.5">
          {favoriteStations.map(station => {
            const alertText = getAlertText(station.id);
            const isAlerting = !!alertText;
            const isLliure = activeReports.some(r => r.station_id === station.id && r.type === "lliure");

            return (
              <div
                key={station.id}
                className={`glass-card rounded-xl p-3.5 flex items-center justify-between border relative ${
                  isAlerting 
                    ? isLliure
                      ? "border-emerald-500/20 bg-emerald-950/5"
                      : "border-red-500/20 bg-red-950/5" 
                    : "border-[#27272a]/60"
                }`}
              >
                {/* Clicking on the body opens the map for this station */}
                <div 
                  onClick={() => onSelectStation(station.id)}
                  className="flex-1 space-y-1.5 cursor-pointer pr-3"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white tracking-tight">{station.name}</span>
                    {station.generalInfo.accessibility && (
                      <span title={t.common.yes}>
                        <Accessibility size={12} className="text-blue-400" />
                      </span>
                    )}
                  </div>

                  {/* Lines Badges */}
                  <div className="flex flex-wrap gap-1">
                    {station.lines.map(lineId => {
                      const line = METRO_LINES[lineId];
                      return (
                        <span
                          key={lineId}
                          className="px-1.5 py-0.5 rounded text-[8px] font-extrabold shadow-sm"
                          style={{ backgroundColor: line?.color || "#52525b", color: line?.textColor || "#fff" }}
                        >
                          {line?.name || lineId}
                        </span>
                      );
                    })}
                  </div>

                  {/* Warnings in favorites */}
                  {isAlerting && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold mt-1.5 ${
                      isLliure ? "text-emerald-400" : "text-red-400"
                    }`}>
                      <ShieldAlert size={12} />
                      <span>{alertText}</span>
                    </div>
                  )}
                </div>

                {/* Right side controls (delete from fav / map navigation) */}
                <div className="flex items-center gap-2">
                  {/* Remove Button */}
                  <button
                    onClick={() => onToggleFavorite(station.id)}
                    className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 active:scale-90 transition-transform"
                    title={t.station.deleteBtn}
                  >
                    <Heart size={15} fill="currentColor" />
                  </button>

                  {/* Map Pin Button */}
                  <button
                    onClick={() => onSelectStation(station.id)}
                    className="h-9 w-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#71717a] active:scale-90 transition-transform"
                  >
                    <MapPin size={15} className="text-zinc-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 space-y-4">
          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#71717a] animate-pulse">
            <Heart size={28} />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="font-bold text-sm text-white">{t.common.empty}</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              {tf.favorites.emptyHint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
