"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, Clock, Accessibility, MapPin, SlidersHorizontal } from "lucide-react";
import { STATIONS, METRO_LINES } from "../../lib/metroData";
import { TRANSLATIONS } from "../../lib/translations";
import { StationReport, Language } from "../../types";

interface ListViewProps {
  activeReports: StationReport[];
  onSelectStation: (stationId: string) => void;
  language: Language;
}

type FilterMode = "all" | "metro" | "rodalies" | "alerts";

export default function ListView({ activeReports, onSelectStation, language }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const t = TRANSLATIONS[language];

  // Filter stations
  const filteredStations = STATIONS.filter(station => {
    // Search match
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCategory = true;
    const hasAlert = activeReports.some(r => r.station_id === station.id);
    
    if (filterMode === "alerts") {
      matchesCategory = hasAlert;
    } else if (filterMode === "metro") {
      matchesCategory = station.type === "metro" || station.type === "both";
    } else if (filterMode === "rodalies") {
      matchesCategory = station.type === "rodalies" || station.type === "both";
    }

    return matchesSearch && matchesCategory;
  });

  const getActiveAlertsText = (stationId: string) => {
    const alerts = activeReports.filter(r => r.station_id === stationId);
    if (alerts.length === 0) return null;
    
    const types = alerts.map(a => a.type);
    
    // Check ticket control sub-types
    if (types.some(t => ["gossos", "mosquits", "pregunta", "gorilles", "lliure"].includes(t))) {
      // Find the specific control subtype to translate
      const controlType = types.find(t => ["gossos", "mosquits", "pregunta", "gorilles", "lliure"].includes(t));
      if (controlType === "lliure") return language === "ru" ? "Свободно" : language === "es" ? "Limpio" : language === "fr" ? "Libre" : "Clear";
      return language === "ru" ? "Контроль билетов" : language === "es" ? "Control de billetes" : language === "fr" ? "Contrôle" : "Ticket check";
    }
    
    if (types.includes("delay")) return language === "ru" ? "Задержка поездов" : language === "es" ? "Retraso de trenes" : language === "fr" ? "Retard" : "Train delays";
    if (types.includes("security")) return language === "ru" ? "Карманники" : language === "es" ? "Carteristas" : language === "fr" ? "Pickpockets" : "Pickpockets";
    return t.station.activeAlerts;
  };

  const getAlertIcon = (stationId: string) => {
    const alerts = activeReports.filter(r => r.station_id === stationId);
    if (alerts.length === 0) return null;
    
    const hasGreen = alerts.some(a => a.type === "lliure");
    if (hasGreen) return <ShieldAlert size={14} className="text-emerald-400" />;
    
    if (alerts.some(a => ["gossos", "mosquits", "gorilles", "security"].includes(a.type))) {
      return <ShieldAlert size={14} className="text-red-400" />;
    }
    return <Clock size={14} className="text-amber-400" />;
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-20 no-scrollbar overflow-y-auto">
      {/* Search Input Container */}
      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[#71717a]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.common.search}
          className="w-full h-11 bg-[#18181b] border border-[#27272a] rounded-xl pl-9 pr-4 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-blue-500/60"
        />
      </div>

      {/* Filter Chips Scroll Container */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar flex-shrink-0">
        {([
          { id: "all" as FilterMode, label: t.common.all },
          { id: "metro" as FilterMode, label: t.common.metro },
          { id: "rodalies" as FilterMode, label: t.common.rodalies },
          { id: "alerts" as FilterMode, label: t.common.alerts }
        ]).map(chip => (
          <button
            key={chip.id}
            onClick={() => setFilterMode(chip.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition active:scale-95 ${
              filterMode === chip.id
                ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold"
                : "bg-[#18181b]/55 border-[#27272a] text-[#71717a]"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
          {language === "ru" ? "Найдено станций:" : language === "es" ? "Estaciones encontradas:" : language === "fr" ? "Stations trouvées:" : "Stations found:"} {filteredStations.length}
        </span>
        <SlidersHorizontal size={12} className="text-[#71717a]" />
      </div>

      {/* Stations List */}
      <div className="space-y-2.5">
        {filteredStations.length > 0 ? (
          filteredStations.map(station => {
            const alertText = getActiveAlertsText(station.id);
            const alertIcon = getAlertIcon(station.id);
            const isLliure = activeReports.some(r => r.station_id === station.id && r.type === "lliure");

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                className={`glass-card rounded-xl p-3.5 flex items-center justify-between border cursor-pointer active:scale-[0.98] transition-all ${
                  alertText 
                    ? isLliure 
                      ? "border-emerald-500/20 bg-emerald-950/5" 
                      : "border-red-500/20 bg-red-950/5"
                    : "border-[#27272a]/60 hover:border-[#3f3f46]/70"
                }`}
              >
                {/* Left Info Column */}
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white tracking-tight">{station.name}</h3>
                    {station.generalInfo.accessibility && (
                      <span title={t.common.yes}>
                        <Accessibility size={12} className="text-blue-400" />
                      </span>
                    )}
                  </div>

                  {/* Lines List */}
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
                </div>

                {/* Right Status / Action Column */}
                <div className="flex items-center gap-2">
                  {alertText && (
                    <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isLliure 
                        ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-950/20 border-red-500/20 text-red-400"
                    }`}>
                      {alertIcon}
                      <span>{alertText}</span>
                    </div>
                  )}

                  <div className="h-7 w-7 rounded-lg bg-[#18181b] flex items-center justify-center text-[#71717a] border border-[#27272a]">
                    <MapPin size={14} className="text-zinc-500" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-xs text-[#71717a]">
            {t.common.empty}
          </div>
        )}
      </div>
    </div>
  );
}
