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

  const getAlertText = (stationId: string) => {
    const alerts = activeReports.filter(r => r.station_id === stationId);
    if (alerts.length === 0) return null;
    
    const types = alerts.map(a => a.type);
    
    // Check ticket control subtypes
    if (types.some(t => ["gossos", "mosquits", "pregunta", "gorilles", "lliure"].includes(t))) {
      const controlType = types.find(t => ["gossos", "mosquits", "pregunta", "gorilles", "lliure"].includes(t));
      if (controlType === "lliure") return language === "ru" ? "Свободно" : language === "es" ? "Limpio" : language === "fr" ? "Libre" : "Clear";
      return language === "ru" ? "Контроль билетов" : language === "es" ? "Control de billetes" : language === "fr" ? "Contrôle" : "Ticket check";
    }
    
    if (types.includes("delay")) return language === "ru" ? "Задержка поездов" : language === "es" ? "Retraso de trenes" : language === "fr" ? "Retard" : "Train delays";
    if (types.includes("security")) return language === "ru" ? "Карманники" : language === "es" ? "Carteristas" : language === "fr" ? "Pickpockets" : "Pickpockets";
    return t.station.activeAlerts;
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-20 no-scrollbar overflow-y-auto">
      {/* Title */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-extrabold text-white tracking-tight">{t.tabs.favorites}</h2>
        <p className="text-xs text-[#71717a] mt-0.5">
          {language === "ru" 
            ? "Быстрый доступ к статусу станций на вашем ежедневном маршруте."
            : language === "es"
            ? "Acceso rápido al estado de las estaciones en tu ruta diaria."
            : language === "fr"
            ? "Accès rapide à l'état des stations sur votre trajet quotidien."
            : "Quick access to the status of stations on your daily route."}
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
              {language === "ru"
                ? "Нажмите кнопку ❤️ в деталях станции на карте, чтобы добавить её в этот список для быстрого отслеживания."
                : language === "es"
                ? "Haz clic en el botón ❤️ en los detalles de la estación en el mapa para añadirla a esta lista."
                : language === "fr"
                ? "Cliquez sur le bouton ❤️ dans les détails de la station sur la carte pour l'ajouter à cette liste."
                : "Click the ❤️ button in the station details on the map to add it to this list."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
