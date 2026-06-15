"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ArrowLeft, Check, PawPrint, HelpCircle, Shield, CheckCircle2, Clock, Lock } from "lucide-react";
import { METRO_LINES } from "../../lib/metroData";
import { TRANSLATIONS, TranslationSchema } from "../../lib/translations";
import { Language } from "../../types";

const METRO_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "metro");
const RODALIES_LINE_IDS = Object.keys(METRO_LINES).filter(id => METRO_LINES[id].type === "rodalies");

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedSystems: string[];
  onToggleSystem: (system: string) => void;
  selectedLines: string[];
  onToggleLine: (lineId: string) => void;
  onToggleAllLines: (lineIds: string[], selectAll: boolean) => void;
  selectedWarnings: string[];
  onToggleWarning: (warningId: string) => void;
  onResetFilters: () => void;
  totalVisibleCount: number;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LinePill({ lineId, isChecked, onToggle }: { lineId: string; isChecked: boolean; onToggle: () => void }) {
  const line = METRO_LINES[lineId];
  return (
    <button
      onClick={onToggle}
      className="h-7 px-2.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 border transition-all duration-150 active:scale-90"
      style={{
        backgroundColor: isChecked ? (line?.color ?? "#52525b") : "rgba(24,24,27,0.4)",
        color: isChecked ? (line?.textColor ?? "#fff") : "#71717a",
        borderColor: isChecked ? "transparent" : "rgba(39,39,42,0.4)",
        boxShadow: isChecked ? `0 0 10px ${line?.color ?? "#52525b"}33` : "none",
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
  onToggleAllLines: (lineIds: string[], selectAll: boolean) => void;
  tl: TranslationSchema["list"];
}) {
  const [linesOpen, setLinesOpen] = useState(false);
  const allSelected = lineIds.every(id => selectedLines.includes(id));

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/5 backdrop-blur-md">
      {/* System toggle row */}
      <button
        onClick={onToggleSystem}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-black/10 active:bg-black/20 transition-colors"
      >
        <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-blue-600 border-blue-500" : "bg-black/20 border-white/10"}`}>
          {checked && <Check size={11} className="text-white" />}
        </span>
        <span className={`text-[13px] font-extrabold tracking-tight ${checked ? "text-white" : "text-zinc-500"}`}>{systemLabel}</span>
      </button>

      {/* Lines accordion */}
      {checked && (
        <>
          <button
            onClick={() => setLinesOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 bg-black/20 border-t border-white/5 active:bg-black/30 transition-colors"
          >
            <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
              {tl.lines} ({lineIds.filter(id => selectedLines.includes(id)).length}/{lineIds.length})
            </span>
            <span className="text-[10px] text-zinc-600">{linesOpen ? "▲" : "▼"}</span>
          </button>

          {linesOpen && (
            <div className="px-4 pb-4 pt-3 bg-black/10 border-t border-white/5 space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  window.scrollTo(0, 0);
                  document.body.scrollTop = 0;
                }}
                placeholder={t.common.search}
                className="w-full bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/85 rounded-xl pl-3 pr-3 py-2.5 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all"
              />
              {/* Toggle All */}
              <button
                onClick={() => onToggleAllLines(lineIds, !allSelected)}
                className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 active:scale-95 transition-all"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${allSelected ? "bg-blue-600 border-blue-500" : "bg-black/20 border-white/10"}`}>
                  {allSelected && <Check size={9} className="text-white" />}
                </span>
                <span>{allSelected ? tl.clearAll : tl.selectAll}</span>
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FilterDrawer({
  isOpen,
  onClose,
  language,
  selectedSystems,
  onToggleSystem,
  selectedLines,
  onToggleLine,
  onToggleAllLines,
  selectedWarnings,
  onToggleWarning,
  onResetFilters,
  totalVisibleCount,
}: FilterDrawerProps) {
  const t = TRANSLATIONS[language];
  const tl = t.list;

  if (!isOpen) return null;

  const activeFilterCount = [
    selectedWarnings.length > 0,
    selectedSystems.length < 2,
    selectedLines.length < (METRO_LINE_IDS.length + RODALIES_LINE_IDS.length),
  ].filter(Boolean).length;

  const warningChips = [
    { id: "gossos", label: language === "ru" ? "Gossos (Собаки)" : "Gossos", icon: PawPrint, colorClass: "border-red-500/30 text-red-400 bg-red-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" },
    { id: "pregunta", label: language === "ru" ? "Pregunta (Опрос)" : "Pregunta", icon: HelpCircle, colorClass: "border-amber-500/30 text-amber-400 bg-amber-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" },
    { id: "gorilles", label: language === "ru" ? "Gorilles (Охрана)" : "Goril·les", icon: Shield, colorClass: "border-red-500/30 text-red-400 bg-red-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" },
    { id: "lliure", label: language === "ru" ? "Lliure (Чисто)" : "Lliure", icon: CheckCircle2, colorClass: "border-emerald-500/30 text-emerald-400 bg-emerald-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" },
    { id: "delay", label: language === "ru" ? "Retraso (Задержка)" : "Delay", icon: Clock, colorClass: "border-amber-500/30 text-amber-400 bg-amber-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" },
    { id: "closed", label: language === "ru" ? "Closed (Закрыто)" : (language === "es" ? "Cerrado" : (language === "fr" ? "Fermé" : "Closed")), icon: Lock, colorClass: "border-red-500/30 text-red-400 bg-red-950/20", defaultClass: "border-white/5 text-zinc-400 bg-black/20" }
  ];

  return (
    <div className="absolute inset-0 z-[1002] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 glass-backdrop" onClick={onClose} />

      {/* Sheet */}
      <div 
        className="relative glass-drawer rounded-r-[32px] rounded-l-none w-[85%] h-full flex flex-col shadow-[-8px_0px_32px_rgba(0,0,0,0.5)] animate-slide-in-right z-10"
      >
        {/* Filter Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white active:scale-90"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <SlidersHorizontal size={15} className="text-blue-500" />
              <span>{tl.filters}</span>
            </h3>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-[10px] font-bold text-blue-400 border border-blue-500/10 px-2.5 py-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 active:scale-95"
            >
              {tl.reset}
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
          {/* Warning types filter */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block pl-0.5">
              {t.report.labelType}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {warningChips.map(item => {
                const isSelected = selectedWarnings.includes(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggleWarning(item.id)}
                    className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold text-center flex items-center gap-2 transition-all duration-150 active:scale-95 ${isSelected ? item.colorClass : item.defaultClass}`}
                  >
                    <Icon size={12} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isSelected && <Check size={10} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Transit systems filter */}
          <div className="space-y-3">
            <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block pl-0.5">
              {t.common.metro} & {t.common.rodalies}
            </span>
            <div className="space-y-3">
              <SystemBlock
                systemLabel={tl.metroSystem}
                checked={selectedSystems.includes("metro")}
                onToggleSystem={() => onToggleSystem("metro")}
                lineIds={METRO_LINE_IDS}
                selectedLines={selectedLines}
                onToggleLine={onToggleLine}
                onToggleAllLines={onToggleAllLines}
                tl={tl}
              />
              <SystemBlock
                systemLabel={tl.rodaliesSystem}
                checked={selectedSystems.includes("rodalies")}
                onToggleSystem={() => onToggleSystem("rodalies")}
                lineIds={RODALIES_LINE_IDS}
                selectedLines={selectedLines}
                onToggleLine={onToggleLine}
                onToggleAllLines={onToggleAllLines}
                tl={tl}
              />
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="p-5 border-t border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold active:scale-95 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] border border-blue-500/20"
          >
            {tl.show} ({totalVisibleCount})
          </button>
        </div>
      </div>
    </div>
  );
}
