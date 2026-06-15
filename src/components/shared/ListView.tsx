"use client";

import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { Search, ShieldAlert, Clock, Accessibility, Heart, SlidersHorizontal, Lock } from "lucide-react";
import { STATIONS, METRO_LINES } from "../../lib/metroData";
import { TRANSLATIONS } from "../../lib/translations";
import { StationReport, Language } from "../../types";
import FilterDrawer from "./FilterDrawer";

interface ListViewProps {
  activeReports: StationReport[];
  onSelectStation: (stationId: string) => void;
  language: Language;
  favoriteIds: string[];
  onToggleFavorite: (stationId: string) => void;
}

type AlertFilter = "all" | "lliure" | "gossos" | "pregunta" | "gorilles" | "delay" | "closed";

const METRO_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "metro");
const RODALIES_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "rodalies");

// ─── Debounce hook ───────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Alert chip button */
const AlertChip = memo(function AlertChip({
  isActive,
  onClick,
  label,
  color,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  const colorMap: Record<string, { active: string; inactive: string }> = {
    blue:    { active: "bg-blue-500/15 border-blue-500/40 text-blue-400",        inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
    emerald: { active: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400", inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
    red:     { active: "bg-red-500/15 border-red-500/40 text-red-400",           inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
    amber:   { active: "bg-amber-500/15 border-amber-500/40 text-amber-400",     inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
    cyan:    { active: "bg-cyan-500/15 border-cyan-500/40 text-cyan-400",        inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
    purple:  { active: "bg-purple-500/15 border-purple-500/40 text-purple-400",  inactive: "bg-[#18181b]/60 border-[#27272a] text-zinc-500" },
  };
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all duration-150 active:scale-95 flex-shrink-0 ${isActive ? c.active : c.inactive}`}
    >
      {label}
    </button>
  );
});

// ─── Colored line stripe helper ───────────────────────────────────────────────
const LineStripes = memo(function LineStripes({ lineIds }: { lineIds: string[] }) {
  const lines = lineIds.map(id => METRO_LINES[id]).filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl overflow-hidden flex flex-col">
      {lines.map((line, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: line.color }} />
      ))}
    </div>
  );
});

// ─── Memoized Station Row ─────────────────────────────────────────────────────
interface StationRowProps {
  station: typeof STATIONS[0];
  stationAlerts: StationReport[];
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  alertAll: string;
  alertLliure: string;
  alertDelay: string;
  alertClosed: string;
  activeAlerts: string;
  accessibilityLabel: string;
}

const StationRow = memo(function StationRow({
  station,
  stationAlerts,
  isFavorite,
  onSelect,
  onToggleFavorite,
  alertLliure,
  alertDelay,
  alertClosed,
  activeAlerts,
  accessibilityLabel,
}: StationRowProps) {
  const hasAlert = stationAlerts.length > 0;
  const isLliure = stationAlerts.some(a => a.type === "lliure");
  const isDanger = stationAlerts.some(a => ["gossos", "gorilles", "closed"].includes(a.type));

  let alertLabel: string | null = null;
  let alertColorClass = "text-amber-400 bg-amber-950/20 border-amber-500/20";
  let AlertIcon: typeof ShieldAlert = ShieldAlert;

  if (hasAlert) {
    if (isLliure) {
      alertLabel = alertLliure;
      alertColorClass = "text-emerald-400 bg-emerald-950/20 border-emerald-500/20";
    } else if (stationAlerts.some(a => a.type === "closed")) {
      alertLabel = alertClosed;
      alertColorClass = "text-red-400 bg-red-950/20 border-red-500/20";
      AlertIcon = Lock;
    } else if (isDanger) {
      alertLabel = activeAlerts;
      alertColorClass = "text-red-400 bg-red-950/20 border-red-500/20";
    } else if (stationAlerts.some(a => a.type === "delay")) {
      alertLabel = alertDelay;
      AlertIcon = Clock;
    } else {
      alertLabel = activeAlerts;
    }
  }

  const outerBorder = hasAlert
    ? isLliure ? "border-emerald-500/20 bg-emerald-950/5" : "border-red-500/20 bg-red-950/5"
    : "border-[#27272a]/60";

  return (
    <div
      onClick={onSelect}
      className={`relative glass-card rounded-xl pl-4 pr-3.5 py-3.5 flex items-center justify-between border cursor-pointer active:scale-[0.98] transition-all overflow-hidden ${outerBorder}`}
    >
      <LineStripes lineIds={station.lines} />

      <div className="space-y-1.5 flex-1 pr-3">
        <div className="flex items-center gap-1.5">
          <h3 className="font-extrabold text-sm text-white tracking-tight">{station.name}</h3>
          {station.generalInfo.accessibility && (
            <span title={accessibilityLabel}>
              <Accessibility size={12} className="text-blue-400" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {station.lines.map(lineId => {
            const line = METRO_LINES[lineId];
            return (
              <span
                key={lineId}
                className="px-1.5 py-0.5 rounded text-[8px] font-extrabold shadow-sm"
                style={{ backgroundColor: line?.color ?? "#52525b", color: line?.textColor ?? "#fff" }}
              >
                {line?.name ?? lineId}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {alertLabel && (
          <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-[10px] font-bold ${alertColorClass}`}>
            <AlertIcon size={12} className="flex-shrink-0" />
            <span>{alertLabel}</span>
          </div>
        )}
        <button
          onClick={onToggleFavorite}
          className="h-8 w-8 rounded-lg bg-[#18181b] flex items-center justify-center border border-[#27272a] flex-shrink-0 active:scale-90 transition-all duration-150"
          aria-label="Add to favorites"
        >
          <Heart
            size={15}
            className={`transition-all duration-200 ${
              isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-zinc-500"
            }`}
          />
        </button>
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ListView({
  activeReports,
  onSelectStation,
  language,
  favoriteIds,
  onToggleFavorite,
}: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 150); // 150ms debounce

  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [showMetro, setShowMetro] = useState(true);
  const [showRodalies, setShowRodalies] = useState(true);
  const [selectedMetroLines, setSelectedMetroLines] = useState<string[]>(METRO_LINE_IDS);
  const [selectedRodaliesLines, setSelectedRodaliesLines] = useState<string[]>(RODALIES_LINE_IDS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const tl = t.list;

  // ── Stable callbacks (useCallback prevents child re-renders) ────────────────

  const handleToggleSystem = useCallback((system: string) => {
    if (system === "metro") setShowMetro(prev => !prev);
    else if (system === "rodalies") setShowRodalies(prev => !prev);
  }, []);

  const handleToggleLine = useCallback((lineId: string) => {
    const isMetro = METRO_LINE_IDS.includes(lineId);
    if (isMetro) {
      setSelectedMetroLines(prev => prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]);
    } else {
      setSelectedRodaliesLines(prev => prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]);
    }
  }, []);

  const handleToggleAllLines = useCallback((lineIds: string[], selectAll: boolean) => {
    const isMetro = lineIds.some(id => METRO_LINE_IDS.includes(id));
    if (isMetro) {
      setSelectedMetroLines(selectAll ? METRO_LINE_IDS : []);
    } else {
      setSelectedRodaliesLines(selectAll ? RODALIES_LINE_IDS : []);
    }
  }, []);

  const handleToggleWarning = useCallback((warningId: string) => {
    setSelectedWarnings(prev =>
      prev.includes(warningId) ? prev.filter(w => w !== warningId) : [...prev, warningId]
    );
  }, []);

  const handleToggleFavoriteClick = useCallback((stationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(stationId);
  }, [onToggleFavorite]);

  const resetFilters = useCallback(() => {
    setSelectedWarnings([]);
    setShowMetro(true);
    setShowRodalies(true);
    setSelectedMetroLines(METRO_LINE_IDS);
    setSelectedRodaliesLines(RODALIES_LINE_IDS);
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────

  const selectedSystems = useMemo(() => {
    return [showMetro && "metro", showRodalies && "rodalies"].filter(Boolean) as string[];
  }, [showMetro, showRodalies]);

  const selectedLinesCombined = useMemo(() => {
    return [...selectedMetroLines, ...selectedRodaliesLines];
  }, [selectedMetroLines, selectedRodaliesLines]);

  // Build a quick lookup map for reports per station — O(n) instead of O(n²) inside filter
  const reportsByStation = useMemo(() => {
    const map = new Map<string, StationReport[]>();
    activeReports.forEach(r => {
      const arr = map.get(r.station_id) || [];
      arr.push(r);
      map.set(r.station_id, arr);
    });
    return map;
  }, [activeReports]);

  const activeFilterCount = [
    selectedWarnings.length > 0,
    !showMetro,
    !showRodalies,
    selectedMetroLines.length < METRO_LINE_IDS.length,
    selectedRodaliesLines.length < RODALIES_LINE_IDS.length,
  ].filter(Boolean).length;

  const alertChips: { id: AlertFilter; label: string; color: string }[] = useMemo(() => [
    { id: "all",      label: tl.alertAll,      color: "blue"    },
    { id: "lliure",   label: tl.alertLliure,   color: "emerald" },
    { id: "gossos",   label: tl.alertGossos,   color: "red"     },
    { id: "pregunta", label: tl.alertPregunta, color: "amber"   },
    { id: "gorilles", label: tl.alertGorilles, color: "red"     },
    { id: "delay",    label: tl.alertDelay,    color: "amber"   },
    { id: "closed",   label: tl.alertClosed,   color: "red"     },
  ], [tl]);

  const baseFiltered = useMemo(() => {
    return STATIONS.filter(station => {
      if (debouncedSearch && !station.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (selectedWarnings.length > 0) {
        const reports = reportsByStation.get(station.id) || [];
        if (!reports.some(r => selectedWarnings.includes(r.type))) return false;
      }
      return true;
    });
  }, [debouncedSearch, selectedWarnings, reportsByStation]); // uses debouncedSearch

  const metroStations = useMemo(() => {
    if (!showMetro) return [];
    return baseFiltered.filter(s => {
      if (s.type !== "metro" && s.type !== "both") return false;
      return s.lines.some(l => selectedMetroLines.includes(l));
    });
  }, [baseFiltered, showMetro, selectedMetroLines]);

  const rodaliesStations = useMemo(() => {
    if (!showRodalies) return [];
    return baseFiltered.filter(s => {
      if (s.type !== "rodalies" && s.type !== "both") return false;
      return s.lines.some(l => selectedRodaliesLines.includes(l));
    });
  }, [baseFiltered, showRodalies, selectedRodaliesLines]);

  const totalVisible = metroStations.length + rodaliesStations.length;



  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ─── Search + filter button ─── */}
      <div className="px-4 pt-4 pb-2 flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => {
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
            }}
            placeholder={t.common.search}
            className="w-full h-11 bg-[#18181b] border border-[#27272a] rounded-xl pl-9 pr-4 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-blue-500/60"
          />
        </div>
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="relative h-11 w-11 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center flex-shrink-0 active:scale-95 transition-all"
          aria-label={tl.filters}
        >
          <SlidersHorizontal size={17} className={activeFilterCount > 0 ? "text-blue-400" : "text-zinc-500"} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Alert type chips ─── */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {alertChips.map(chip => (
            <AlertChip
              key={chip.id}
              isActive={chip.id === "all" ? selectedWarnings.length === 0 : selectedWarnings.includes(chip.id)}
              onClick={() => {
                if (chip.id === "all") setSelectedWarnings([]);
                else setSelectedWarnings([chip.id]);
              }}
              label={chip.label}
              color={chip.color}
            />
          ))}
        </div>
      </div>

      {/* ─── Station results ─── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-5">

        {showMetro && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">{tl.metroStations}</span>
              <span className="text-[10px] text-zinc-600">{metroStations.length}</span>
            </div>
            {metroStations.length > 0
              ? <div className="space-y-2.5">
                  {metroStations.map(station => (
                    <StationRow
                      key={station.id}
                      station={station}
                      stationAlerts={reportsByStation.get(station.id) || []}
                      isFavorite={favoriteIds.includes(station.id)}
                      onSelect={() => onSelectStation(station.id)}
                      onToggleFavorite={(e) => handleToggleFavoriteClick(station.id, e)}
                      alertAll={tl.alertAll}
                      alertLliure={tl.alertLliure}
                      alertDelay={tl.alertDelay}
                      alertClosed={tl.alertClosed}
                      activeAlerts={t.station.activeAlerts}
                      accessibilityLabel={t.common.yes}
                    />
                  ))}
                </div>
              : <div className="text-center py-6 text-xs text-zinc-600">{t.common.empty}</div>
            }
          </div>
        )}

        {showRodalies && (
          <div className="space-y-2 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">{tl.rodaliesStations}</span>
              <span className="text-[10px] text-zinc-600">{rodaliesStations.length}</span>
            </div>
            {rodaliesStations.length > 0
              ? <div className="space-y-2.5">
                  {rodaliesStations.map(station => (
                    <StationRow
                      key={station.id}
                      station={station}
                      stationAlerts={reportsByStation.get(station.id) || []}
                      isFavorite={favoriteIds.includes(station.id)}
                      onSelect={() => onSelectStation(station.id)}
                      onToggleFavorite={(e) => handleToggleFavoriteClick(station.id, e)}
                      alertAll={tl.alertAll}
                      alertLliure={tl.alertLliure}
                      alertDelay={tl.alertDelay}
                      alertClosed={tl.alertClosed}
                      activeAlerts={t.station.activeAlerts}
                      accessibilityLabel={t.common.yes}
                    />
                  ))}
                </div>
              : <div className="text-center py-6 text-xs text-zinc-600">{t.common.empty}</div>
            }
          </div>
        )}

        {!showMetro && !showRodalies && (
          <div className="text-center py-16 text-xs text-zinc-600">{t.common.empty}</div>
        )}
      </div>

      <FilterDrawer
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        language={language}
        selectedSystems={selectedSystems}
        onToggleSystem={handleToggleSystem}
        selectedLines={selectedLinesCombined}
        onToggleLine={handleToggleLine}
        onToggleAllLines={handleToggleAllLines}
        selectedWarnings={selectedWarnings}
        onToggleWarning={handleToggleWarning}
        onResetFilters={resetFilters}
        totalVisibleCount={totalVisible}
      />
    </div>
  );
}
