"use client";

import React, { useState, useMemo } from "react";
import { Search, ShieldAlert, Clock, Accessibility, MapPin, SlidersHorizontal, X, Check } from "lucide-react";
import { STATIONS, METRO_LINES } from "../../lib/metroData";
import { TRANSLATIONS } from "../../lib/translations";
import { StationReport, Language } from "../../types";

interface ListViewProps {
  activeReports: StationReport[];
  onSelectStation: (stationId: string) => void;
  language: Language;
}

type AlertFilter = "all" | "lliure" | "gossos" | "mosquits" | "pregunta" | "gorilles" | "delay" | "crowd" | "security";

const METRO_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "metro");
const RODALIES_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "rodalies");

// ─── Sub-components (module-level) ───────────────────────────────────────────

/** Single line pill toggle */
function LinePill({ lineId, isChecked, onToggle }: { lineId: string; isChecked: boolean; onToggle: () => void }) {
  const line = METRO_LINES[lineId];
  return (
    <button
      onClick={onToggle}
      className="h-7 px-2.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 border transition-all duration-150 active:scale-90"
      style={{
        backgroundColor: isChecked ? (line?.color ?? "#52525b") : "rgba(24,24,27,0.8)",
        color: isChecked ? (line?.textColor ?? "#fff") : "#71717a",
        borderColor: isChecked ? "transparent" : "#27272a",
        boxShadow: isChecked ? `0 0 10px ${line?.color ?? "#52525b"}55` : "none",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: isChecked ? (line?.textColor ?? "#fff") : (line?.color ?? "#71717a") }}
      />
      {line?.name ?? lineId}
    </button>
  );
}

/** System block with checkbox + collapsible line grid */
function SystemBlock({
  systemLabel,
  checked,
  onToggleSystem,
  lineIds,
  selectedLines,
  onToggleLine,
  onToggleAllLines,
  tl,
}: {
  systemLabel: string;
  checked: boolean;
  onToggleSystem: () => void;
  lineIds: string[];
  selectedLines: string[];
  onToggleLine: (id: string) => void;
  onToggleAllLines: () => void;
  tl: typeof TRANSLATIONS["en"]["list"];
}) {
  const [linesOpen, setLinesOpen] = useState(false);
  const allSelected = lineIds.every(id => selectedLines.includes(id));

  return (
    <div className="rounded-2xl border border-[#1c1c1f] overflow-hidden">
      {/* System toggle row */}
      <button
        onClick={onToggleSystem}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#121214]/80 active:bg-[#18181b] transition-colors"
      >
        <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-blue-600 border-blue-500" : "bg-[#18181b] border-[#3f3f46]"}`}>
          {checked && <Check size={11} className="text-white" />}
        </span>
        <span className={`text-[13px] font-extrabold tracking-tight ${checked ? "text-white" : "text-zinc-500"}`}>{systemLabel}</span>
      </button>

      {/* Lines accordion */}
      {checked && (
        <>
          <button
            onClick={() => setLinesOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 bg-[#0c0c0e]/60 border-t border-[#1c1c1f] active:bg-[#121214] transition-colors"
          >
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
              {tl.lines} ({selectedLines.length}/{lineIds.length})
            </span>
            <span className="text-[10px] text-zinc-600">{linesOpen ? "▲" : "▼"}</span>
          </button>

          {linesOpen && (
            <div className="px-4 pb-4 pt-3 bg-[#0c0c0e]/40 border-t border-[#1c1c1f] space-y-3">
              {/* Toggle All */}
              <button
                onClick={onToggleAllLines}
                className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 active:scale-95 transition-all"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${allSelected ? "bg-blue-600 border-blue-500" : "bg-[#18181b] border-[#3f3f46]"}`}>
                  {allSelected && <Check size={9} className="text-white" />}
                </span>
                <span>{allSelected ? tl.clearAll : tl.selectAll}</span>
                <span className="text-zinc-600">({selectedLines.length}/{lineIds.length})</span>
              </button>

              {/* Line pills */}
              <div className="flex flex-wrap gap-2">
                {lineIds.map(id => (
                  <LinePill key={id} lineId={id} isChecked={selectedLines.includes(id)} onToggle={() => onToggleLine(id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Alert type checkbox row */
function AlertChip({
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
}

// ─── Colored line stripe helper ───────────────────────────────────────────────

function LineStripes({ lineIds }: { lineIds: string[] }) {
  const lines = lineIds.map(id => METRO_LINES[id]).filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl overflow-hidden flex flex-col">
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex-1"
          style={{ backgroundColor: line.color }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ListView({ activeReports, onSelectStation, language }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all");
  const [showMetro, setShowMetro] = useState(true);
  const [showRodalies, setShowRodalies] = useState(true);
  const [selectedMetroLines, setSelectedMetroLines] = useState<string[]>(METRO_LINE_IDS);
  const [selectedRodaliesLines, setSelectedRodaliesLines] = useState<string[]>(RODALIES_LINE_IDS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const tl = t.list;

  // Number of non-default active filters
  const activeFilterCount = [
    alertFilter !== "all",
    !showMetro,
    !showRodalies,
    selectedMetroLines.length < METRO_LINE_IDS.length,
    selectedRodaliesLines.length < RODALIES_LINE_IDS.length,
  ].filter(Boolean).length;

  const alertChips: { id: AlertFilter; label: string; color: string }[] = [
    { id: "all",      label: tl.alertAll,      color: "blue"    },
    { id: "lliure",   label: tl.alertLliure,   color: "emerald" },
    { id: "gossos",   label: tl.alertGossos,   color: "red"     },
    { id: "mosquits", label: tl.alertMosquits, color: "red"     },
    { id: "pregunta", label: tl.alertPregunta, color: "amber"   },
    { id: "gorilles", label: tl.alertGorilles, color: "red"     },
    { id: "delay",    label: tl.alertDelay,    color: "amber"   },
    { id: "crowd",    label: tl.alertCrowd,    color: "cyan"    },
    { id: "security", label: tl.alertSecurity, color: "purple"  },
  ];

  const toggleLine = (lineId: string, isMetro: boolean) => {
    if (isMetro) {
      setSelectedMetroLines(prev => prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]);
    } else {
      setSelectedRodaliesLines(prev => prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]);
    }
  };

  // Bidirectional toggle: if all selected → clear all; otherwise → select all
  const toggleAllMetroLines = () =>
    setSelectedMetroLines(prev => prev.length === METRO_LINE_IDS.length ? [] : METRO_LINE_IDS);
  const toggleAllRodaliesLines = () =>
    setSelectedRodaliesLines(prev => prev.length === RODALIES_LINE_IDS.length ? [] : RODALIES_LINE_IDS);

  const resetFilters = () => {
    setAlertFilter("all");
    setShowMetro(true);
    setShowRodalies(true);
    setSelectedMetroLines(METRO_LINE_IDS);
    setSelectedRodaliesLines(RODALIES_LINE_IDS);
  };

  const baseFiltered = useMemo(() => {
    return STATIONS.filter(station => {
      if (searchQuery && !station.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (alertFilter !== "all") {
        if (!activeReports.some(r => r.station_id === station.id && r.type === alertFilter)) return false;
      }
      return true;
    });
  }, [searchQuery, alertFilter, activeReports]);

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

  const renderStation = (station: typeof STATIONS[0]) => {
    const stationAlerts = activeReports.filter(r => r.station_id === station.id);
    const hasAlert = stationAlerts.length > 0;
    const isLliure = stationAlerts.some(a => a.type === "lliure");
    const isDanger = stationAlerts.some(a => ["gossos", "mosquits", "gorilles", "security"].includes(a.type));

    let alertLabel: string | null = null;
    let alertColorClass = "text-amber-400 bg-amber-950/20 border-amber-500/20";
    let AlertIcon: typeof ShieldAlert = ShieldAlert;

    if (hasAlert) {
      if (isLliure) {
        alertLabel = tl.alertLliure;
        alertColorClass = "text-emerald-400 bg-emerald-950/20 border-emerald-500/20";
      } else if (isDanger) {
        alertLabel = t.station.activeAlerts;
        alertColorClass = "text-red-400 bg-red-950/20 border-red-500/20";
      } else if (stationAlerts.some(a => a.type === "delay")) {
        alertLabel = tl.alertDelay;
        AlertIcon = Clock;
      } else {
        alertLabel = t.station.activeAlerts;
      }
    }

    const outerBorder = hasAlert
      ? isLliure ? "border-emerald-500/20 bg-emerald-950/5" : "border-red-500/20 bg-red-950/5"
      : "border-[#27272a]/60";

    return (
      <div
        key={station.id}
        onClick={() => onSelectStation(station.id)}
        className={`relative glass-card rounded-xl pl-4 pr-3.5 py-3.5 flex items-center justify-between border cursor-pointer active:scale-[0.98] transition-all overflow-hidden ${outerBorder}`}
      >
        {/* Colored line stripe on left edge */}
        <LineStripes lineIds={station.lines} />

        <div className="space-y-1.5 flex-1 pr-3">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-sm text-white tracking-tight">{station.name}</h3>
            {station.generalInfo.accessibility && (
              <span title={t.common.yes}><Accessibility size={12} className="text-blue-400" /></span>
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
          <div className="h-7 w-7 rounded-lg bg-[#18181b] flex items-center justify-center border border-[#27272a] flex-shrink-0">
            <MapPin size={14} className="text-zinc-500" />
          </div>
        </div>
      </div>
    );
  };

  const totalVisible = metroStations.length + rodaliesStations.length;

  return (
    <div className="flex-1 flex flex-col pb-20 overflow-hidden">

      {/* ─── Search + filter button ─── */}
      <div className="px-4 pt-4 pb-2 flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

      {/* ─── Alert type chips (always visible) ─── */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {alertChips.map(chip => (
            <AlertChip
              key={chip.id}
              isActive={alertFilter === chip.id}
              onClick={() => setAlertFilter(chip.id)}
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
              ? <div className="space-y-2.5">{metroStations.map(renderStation)}</div>
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
              ? <div className="space-y-2.5">{rodaliesStations.map(renderStation)}</div>
              : <div className="text-center py-6 text-xs text-zinc-600">{t.common.empty}</div>
            }
          </div>
        )}

        {!showMetro && !showRodalies && (
          <div className="text-center py-16 text-xs text-zinc-600">{t.common.empty}</div>
        )}
      </div>

      {/* ─── Filter bottom sheet ─── */}
      {filterSheetOpen && (
        <div className="absolute inset-0 z-[800] flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setFilterSheetOpen(false)} />

          {/* Sheet */}
          <div className="relative bg-[#09090b] border-t border-x border-[#1c1c1f] rounded-t-3xl max-h-[82vh] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-[#27272a] mx-auto mt-3 mb-1 flex-shrink-0" />

            {/* Header */}
            <div className="px-5 py-3 border-b border-[#1c1c1f] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-blue-400" />
                <span className="font-extrabold text-sm text-white">{tl.filters}</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-blue-400 font-bold border border-blue-500/20 bg-blue-500/5 px-3 py-1 rounded-lg active:scale-95 transition-all"
                  >
                    {tl.reset}
                  </button>
                )}
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="h-8 w-8 rounded-xl bg-[#1c1c1f] flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">

              {/* Alert type filter section */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                  {t.report.labelType}
                </span>
                <div className="flex flex-wrap gap-2">
                  {alertChips.map(chip => (
                    <AlertChip
                      key={chip.id}
                      isActive={alertFilter === chip.id}
                      onClick={() => setAlertFilter(chip.id)}
                      label={chip.label}
                      color={chip.color}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#1c1c1f]" />

              {/* Metro system + lines */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                  {t.common.metro}
                </span>
                <SystemBlock
                  systemLabel={tl.metroSystem}
                  checked={showMetro}
                  onToggleSystem={() => setShowMetro(v => !v)}
                  lineIds={METRO_LINE_IDS}
                  selectedLines={selectedMetroLines}
                  onToggleLine={id => toggleLine(id, true)}
                  onToggleAllLines={toggleAllMetroLines}
                  tl={tl}
                />
              </div>

              {/* Rodalies system + lines */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                  {t.common.rodalies}
                </span>
                <SystemBlock
                  systemLabel={tl.rodaliesSystem}
                  checked={showRodalies}
                  onToggleSystem={() => setShowRodalies(v => !v)}
                  lineIds={RODALIES_LINE_IDS}
                  selectedLines={selectedRodaliesLines}
                  onToggleLine={id => toggleLine(id, false)}
                  onToggleAllLines={toggleAllRodaliesLines}
                  tl={tl}
                />
              </div>
            </div>

            {/* Apply button */}
            <div className="p-5 border-t border-[#1c1c1f] flex-shrink-0">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="w-full h-12 bg-blue-600 text-white rounded-xl text-xs font-extrabold active:scale-95 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.35)]"
              >
                {tl.show} ({totalVisible})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
