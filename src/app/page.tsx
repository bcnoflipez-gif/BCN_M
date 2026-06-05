"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  X, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  SlidersHorizontal, 
  Eye,
  PawPrint,
  EyeOff,
  HelpCircle,
  Shield,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle
} from "lucide-react";
import MobileLayout from "../components/shared/MobileLayout";
import TopHeader from "../components/shared/TopHeader";
import BottomNav, { TabId } from "../components/shared/BottomNav";
import Map from "../components/shared/Map";
import ListView from "../components/shared/ListView";
import FavoritesView from "../components/shared/FavoritesView";
import ProfileView from "../components/shared/ProfileView";
import StationSheet from "../components/shared/StationSheet";

import { STATIONS, METRO_LINES } from "../lib/metroData";
import { StationReport, Language } from "../types";
import { dbService, getOrCreateProfile } from "../lib/db";
import { parseTelegramMessage } from "../lib/telegramParser";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [activeReports, setActiveReports] = useState<StationReport[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("ru");

  // Smart Multi-Select Filter Panel State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["metro", "rodalies"]);
  const [selectedLines, setSelectedLines] = useState<string[]>(Object.keys(METRO_LINES));
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]); // empty means show all stations (no warning filter)

  // Telegram Simulator State
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [simText, setSimText] = useState("");
  const [simResult, setSimResult] = useState<{
    success: boolean;
    text: string;
    station?: string;
    type?: string;
  } | null>(null);

  // User Role State
  const [userRole, setUserRole] = useState<"user" | "admin">("user");

  // Initial loads & setup Supabase Realtime subscriptions for 5k+ scaling
  useEffect(() => {
    const profile = getOrCreateProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(profile.language || "ru");
    setUserRole(profile.role || "user");
    
    loadReports();
    loadFavorites();

    // Setup Supabase Realtime connection
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("realtime-reports-comments")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "reports" },
          (payload) => {
            const newReport = payload.new as StationReport;
            // Only add if not expired
            if (new Date(newReport.expires_at).getTime() > new Date().getTime()) {
              setActiveReports((prev) => {
                if (prev.some((r) => r.id === newReport.id)) return prev;
                return [newReport, ...prev];
              });
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "reports" },
          () => {
            loadReports(); // reload all active warnings on deletion
          }
        )
        .subscribe();

      return () => {
        if (supabase) supabase.removeChannel(channel);
      };
    } else {
      // Offline fallback: poll reports every 20 seconds
      const interval = setInterval(loadReports, 20000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const profile = getOrCreateProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(profile.role || "user");
  }, [activeTab]);

  async function loadReports() {
    const data = await dbService.getReports();
    setActiveReports(data);
  }

  function loadFavorites() {
    const favs = dbService.getFavorites();
    setFavoriteIds(favs);
  }

  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setActiveTab("map"); // Switch back to map
  };

  const handleToggleFavorite = (stationId: string) => {
    const updated = dbService.toggleFavorite(stationId);
    setFavoriteIds(updated);
  };

  const handleSimulateTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimResult(null);

    const trimmed = simText.trim();
    if (!trimmed) return;

    // Parse the message
    const { matched, station, type, description } = parseTelegramMessage(trimmed);

    if (matched && station && type) {
      const report = await dbService.addReport(station.id, type, description);
      if (report) {
        setSimResult({
          success: true,
          text: language === "ru" 
            ? `Успешно нанесено! Станция: ${station.name}` 
            : `Success! Station: ${station.name}`,
          station: station.name,
          type
        });
        setSimText("");
        loadReports();
      } else {
        setSimResult({ success: false, text: "DB Error" });
      }
    } else {
      let reason = language === "ru" 
        ? "Не удалось распознать станцию или ключевое слово проблемы."
        : "Failed to recognize station name or warning keyword.";
      if (station && !type) {
        reason = language === "ru"
          ? `Найдена станция "${station.name}", но тип контроля не определен.`
          : `Found station "${station.name}" but warning type is unknown.`;
      } else if (!station && type) {
        reason = language === "ru"
          ? `Распознана проблема (${type}), но название станции не найдено.`
          : `Recognized warning type (${type}) but station was not found.`;
      }
      setSimResult({ success: false, text: reason });
    }
  };

  const toggleLineFilter = (lineId: string) => {
    setSelectedLines(prev => 
      prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]
    );
  };

  const toggleSystemFilter = (system: string) => {
    setSelectedSystems(prev => 
      prev.includes(system) ? prev.filter(s => s !== system) : [...prev, system]
    );
  };

  const toggleWarningFilter = (type: string) => {
    setSelectedWarnings(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const selectAllFilters = () => {
    setSelectedSystems(["metro", "rodalies"]);
    setSelectedLines(Object.keys(METRO_LINES));
    setSelectedWarnings([]);
  };

  const currentSelectedStation = STATIONS.find(s => s.id === selectedStationId) || null;

  return (
    <MobileLayout>
      {/* Top Header */}
      <TopHeader activeAlertsCount={activeReports.length} />

      {/* Main Tab Views */}
      <main className="flex-1 relative flex flex-col min-h-0 bg-[#09090b]">
        {/* TAB 1: MAP */}
        <div className={`absolute inset-0 flex flex-col ${activeTab === "map" ? "visible" : "invisible pointer-events-none"}`}>
          {/* Smart Filter Floating Toggle */}
          <div className="absolute top-3 left-3 z-[900]">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg border backdrop-blur-md bg-[#09090b]/85 border-[#18181b]/80 text-white flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <SlidersHorizontal size={14} className="text-blue-500" />
              <span>
                {language === "ru" ? "Фильтры" : language === "es" ? "Filtros" : language === "fr" ? "Filtres" : "Filters"}
              </span>
              {selectedWarnings.length > 0 && (
                <span className="h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  {selectedWarnings.length}
                </span>
              )}
            </button>
          </div>

          {/* Interactive Map */}
          <Map
            stations={STATIONS}
            activeReports={activeReports}
            selectedStationId={selectedStationId}
            onSelectStation={handleSelectStation}
            selectedLines={selectedLines}
            selectedSystems={selectedSystems}
            selectedWarnings={selectedWarnings}
            language={language}
            isAdmin={userRole === "admin"}
          />

          {/* Floating Action Button for Telegram Simulator */}
          {userRole === "admin" && (
            <button
              onClick={() => setIsSimOpen(true)}
              className="absolute bottom-20 right-4 z-[900] h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform border border-blue-500/30"
              title="Simulate Telegram Message"
            >
              <Send size={18} />
            </button>
          )}

          {/* Station Detail pull-up sheet */}
          {selectedStationId && currentSelectedStation && (
            <StationSheet
              station={currentSelectedStation}
              onClose={() => setSelectedStationId(null)}
              activeReports={activeReports}
              onReportAdded={loadReports}
              isFavorite={favoriteIds.includes(selectedStationId)}
              onToggleFavorite={() => handleToggleFavorite(selectedStationId)}
              language={language}
            />
          )}
        </div>

        {/* TAB 2: LIST */}
        {activeTab === "list" && (
          <ListView
            activeReports={activeReports}
            onSelectStation={handleSelectStation}
            language={language}
          />
        )}

        {/* TAB 3: FAVORITES */}
        {activeTab === "favorites" && (
          <FavoritesView
            favoriteIds={favoriteIds}
            activeReports={activeReports}
            onSelectStation={handleSelectStation}
            onToggleFavorite={handleToggleFavorite}
            language={language}
          />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <ProfileView onLanguageChange={setLanguage} />
        )}
      </main>

      {/* SMART MULTI-SELECT FILTER PANEL OVERLAY */}
      {isFilterOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[1002] flex flex-col justify-end">
          {/* Backdrop Tap to close */}
          <div className="absolute inset-0 z-[-1]" onClick={() => setIsFilterOpen(false)} />
          
          <div className="bg-[#09090b]/95 border-t border-x border-[#1c1c1f] rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-800 mx-auto mt-3 mb-1 flex-shrink-0" />

            {/* Filter Header */}
            <div className="px-5 py-3 border-b border-[#1c1c1f]/60 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-[#fafafa] flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-blue-500" />
                  <span>
                    {language === "ru" ? "Умные фильтры" : language === "es" ? "Filtros inteligentes" : language === "fr" ? "Filtres intelligents" : "Smart Filters"}
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                  {language === "ru" ? "Настройка отображения карты и списков" : language === "es" ? "Configura el mapa y las listas" : language === "fr" ? "Configurez la carte et les listes" : "Configure map and list view options"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllFilters}
                  className="text-[10px] font-bold text-blue-400 border border-blue-500/10 px-2.5 py-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 active:scale-95 transition-all duration-200"
                >
                  {language === "ru" ? "Сбросить все" : language === "es" ? "Restaurar" : language === "fr" ? "Réinitialiser" : "Reset All"}
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="h-8 w-8 rounded-xl bg-[#1c1c1f] flex items-center justify-center text-[#71717a] hover:text-[#fafafa] active:scale-90 transition-all duration-200"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {/* Filter 1: Systems */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block pl-0.5">
                  {language === "ru" ? "Сеть транспорта" : language === "es" ? "Red de Transporte" : language === "fr" ? "Réseau" : "Transit Networks"}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => toggleSystemFilter("metro")}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
                      selectedSystems.includes("metro")
                        ? "border-blue-500/50 text-blue-400 bg-blue-500/10 font-extrabold shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "border-[#1c1c1f] text-zinc-400 bg-[#121214]/60 hover:border-zinc-800"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-black">Ⓜ</div>
                    <span>TMB Metro</span>
                    {selectedSystems.includes("metro") && <Check size={12} className="ml-auto text-blue-400" />}
                  </button>
                  <button
                    onClick={() => toggleSystemFilter("rodalies")}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
                      selectedSystems.includes("rodalies")
                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10 font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        : "border-[#1c1c1f] text-zinc-400 bg-[#121214]/60 hover:border-zinc-800"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400 font-black">🟠</div>
                    <span>Rodalies</span>
                    {selectedSystems.includes("rodalies") && <Check size={12} className="ml-auto text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* Filter 2: Warnings (Tickboxes) */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block pl-0.5">
                  {language === "ru" ? "Типы предупреждений" : language === "es" ? "Tipos de alerta" : language === "fr" ? "Types d'alerte" : "Warning Types"}
                </span>
                <div className="bg-[#121214]/40 border border-[#1c1c1f] p-4 rounded-2xl space-y-3 shadow-inner">
                  <div className="text-[10px] text-zinc-500 leading-normal flex items-start gap-2 pb-2.5 border-b border-[#1c1c1f]">
                    <Eye size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "ru" 
                        ? "Выберите предупреждения, чтобы показать ТОЛЬКО станции с этими активными оповещениями. Оставьте пустым, чтобы показать все."
                        : language === "es"
                        ? "Filtra estaciones por alertas activas. Mantén todo vacío para mostrar todas las estaciones."
                        : "Filtrez les stations par alertes actives. Laissez vide pour tout afficher."}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "gossos", label: language === "ru" ? "Gossos (Собаки)" : "Gossos", icon: PawPrint, colorClass: "border-red-500/40 text-red-400 bg-red-950/10 shadow-[0_0_8px_rgba(239,68,68,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "mosquits", label: language === "ru" ? "Mosquits (Гражд.)" : "Mosquits", icon: EyeOff, colorClass: "border-red-500/40 text-red-400 bg-red-950/10 shadow-[0_0_8px_rgba(239,68,68,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "pregunta", label: language === "ru" ? "Pregunta (Опрос)" : "Pregunta", icon: HelpCircle, colorClass: "border-amber-500/40 text-amber-400 bg-amber-950/10 shadow-[0_0_8px_rgba(245,158,11,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "gorilles", label: language === "ru" ? "Gorilles (Охрана)" : "Goril·les", icon: Shield, colorClass: "border-red-500/40 text-red-400 bg-red-950/10 shadow-[0_0_8px_rgba(239,68,68,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "lliure", label: language === "ru" ? "Lliure (Чисто)" : "Lliure", icon: CheckCircle2, colorClass: "border-emerald-500/40 text-emerald-400 bg-emerald-950/10 shadow-[0_0_8px_rgba(16,185,129,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "delay", label: language === "ru" ? "Retraso (Задержка)" : "Delay", icon: Clock, colorClass: "border-amber-500/40 text-amber-400 bg-amber-950/10 shadow-[0_0_8px_rgba(245,158,11,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "crowd", label: language === "ru" ? "Crowd (Толпа)" : "Crowd", icon: Users, colorClass: "border-cyan-500/40 text-cyan-400 bg-cyan-950/10 shadow-[0_0_8px_rgba(6,182,212,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" },
                      { id: "security", label: language === "ru" ? "Theft (Вор)" : "Theft", icon: AlertTriangle, colorClass: "border-purple-500/40 text-purple-400 bg-purple-950/10 shadow-[0_0_8px_rgba(168,85,247,0.1)]", defaultClass: "border-[#1c1c1f] text-zinc-400 bg-[#09090b]/40 hover:border-zinc-800" }
                    ]).map(item => {
                      const Icon = item.icon;
                      const isSelected = selectedWarnings.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleWarningFilter(item.id)}
                          className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold text-center flex items-center gap-2 transition-all duration-200 active:scale-95 ${
                            isSelected ? item.colorClass : item.defaultClass
                          }`}
                        >
                          <Icon size={13} className="flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {isSelected && <Check size={10} className="ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Filter 3: Lines */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block pl-0.5">
                  {language === "ru" ? "Линии транспорта" : language === "es" ? "Líneas de transporte" : language === "fr" ? "Lignes" : "Specific Transit Lines"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(METRO_LINES).map(([id, line]) => {
                    const isChecked = selectedLines.includes(id);

                    return (
                      <button
                        key={id}
                        onClick={() => toggleLineFilter(id)}
                        className="h-9 px-3 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all duration-200 active:scale-90 border"
                        style={{
                          backgroundColor: isChecked ? line.color : "rgba(18, 18, 20, 0.4)",
                          color: isChecked ? line.textColor : "#a1a1aa",
                          borderColor: isChecked ? "transparent" : "#1c1c1f",
                          boxShadow: isChecked ? `0 0 10px ${line.color}33` : "none"
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isChecked ? line.textColor : line.color }} />
                        <span>{line.name}</span>
                        {isChecked && <Check size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Footer */}
            <div className="p-5 border-t border-[#1c1c1f]/60 flex-shrink-0">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)] border border-blue-500/20"
              >
                <span>
                  {language === "ru" ? "Применить фильтры" : language === "es" ? "Aplicar filtros" : language === "fr" ? "Appliquer" : "Apply Filters"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram simulator Modal */}
      {isSimOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-sm p-4 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsSimOpen(false);
                setSimResult(null);
                setSimText("");
              }}
              className="absolute top-3 right-3 text-[#71717a] hover:text-[#a1a1aa] active:scale-95 transition"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <MessageSquare size={16} className="text-blue-500" />
                <span>Симулятор Telegram</span>
              </h3>
              <p className="text-[10px] text-[#71717a]">
                {language === "ru"
                  ? "Введите текст сообщения из чата, чтобы протестировать автоматический парсинг станций и предупреждений."
                  : "Enter the text of a chat message to simulate webhook warning ingestion."}
              </p>
            </div>

            <form onSubmit={handleSimulateTelegram} className="space-y-3">
              <textarea
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="Пример: 'Gossos en Catalunya L3!!' или 'Проверка билетов на выходе из Universitat L1 (mosquits)'"
                rows={3}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl p-3 text-xs text-[#fafafa] placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 font-medium"
                maxLength={200}
                required
              />

              {simResult && (
                <div 
                  className={`p-3 rounded-xl border text-[11px] font-medium flex gap-2 ${
                    simResult.success
                      ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
                      : "bg-red-950/20 text-red-400 border-red-500/20"
                  }`}
                >
                  {simResult.success ? <Check size={14} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />}
                  <span>{simResult.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Смоделировать парсинг</span>
              </button>
            </form>

            <div className="bg-[#09090b]/55 border border-[#27272a]/40 rounded-xl p-2.5 text-[9px] text-[#71717a] leading-relaxed">
              <span className="font-bold text-zinc-500 block mb-0.5">Примеры триггеров:</span>
              <div>• Станции: Catalunya, Sabadell, Badalona, Diagonal, Universitat...</div>
              <div>• Контроль: gossos (собаки), mosquits (гражданские), pregunta (опрос), gorilles (охрана), lliure (чисто)...</div>
              <div>• Задержка: retraso, стоит поезд, задержка...</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        favoritesCount={favoriteIds.length}
        language={language}
      />
    </MobileLayout>
  );
}
