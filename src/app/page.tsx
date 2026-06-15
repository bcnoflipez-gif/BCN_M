"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  SlidersHorizontal, 
  ArrowLeft
} from "lucide-react";
import MobileLayout from "../components/shared/MobileLayout";
import TopHeader from "../components/shared/TopHeader";
import BottomNav, { TabId } from "../components/shared/BottomNav";
import Map from "../components/shared/Map";
import ListView from "../components/shared/ListView";
import FavoritesView from "../components/shared/FavoritesView";
import ProfileView from "../components/shared/ProfileView";
import StationSheet from "../components/shared/StationSheet";
import FilterDrawer from "../components/shared/FilterDrawer";

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
  const [isMounted, setIsMounted] = useState(false);

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
    setIsMounted(true);
    
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

  const handleToggleAllLines = (lineIds: string[], selectAll: boolean) => {
    if (selectAll) {
      setSelectedLines(prev => [...new Set([...prev, ...lineIds])]);
    } else {
      setSelectedLines(prev => prev.filter(id => !lineIds.includes(id)));
    }
  };

  const visibleStationsCount = React.useMemo(() => {
    return STATIONS.filter(s => {
      // System check
      if (!selectedSystems.includes(s.type) && s.type !== "both") {
        if (s.type === "metro" || s.type === "rodalies") return false;
      }
      // Lines check
      const hasLine = s.lines.some(l => selectedLines.includes(l));
      if (!hasLine) return false;
      // Warnings check
      if (selectedWarnings.length > 0) {
        const stationWarnings = activeReports.filter(r => r.station_id === s.id);
        const hasWarning = stationWarnings.some(w => selectedWarnings.includes(w.type));
        if (!hasWarning) return false;
      }
      return true;
    }).length;
  }, [selectedSystems, selectedLines, selectedWarnings, activeReports]);

  const currentSelectedStation = STATIONS.find(s => s.id === selectedStationId) || null;

  // Prevent hydration mismatch: render a structurally-matching skeleton until client-mounted
  // Returning null would cause a server/client tree mismatch with MobileLayout's Suspense wrapper
  if (!isMounted) {
    return (
      <MobileLayout>
        <div suppressHydrationWarning className="flex-1 bg-[#09090b]" />
      </MobileLayout>
    );
  }

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
          <ProfileView 
            onLanguageChange={setLanguage} 
            onProfileChange={(prof) => {
              setUserRole(prof.role || "user");
            }}
          />
        )}
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        language={language}
        selectedSystems={selectedSystems}
        onToggleSystem={toggleSystemFilter}
        selectedLines={selectedLines}
        onToggleLine={toggleLineFilter}
        onToggleAllLines={handleToggleAllLines}
        selectedWarnings={selectedWarnings}
        onToggleWarning={toggleWarningFilter}
        onResetFilters={selectAllFilters}
        totalVisibleCount={visibleStationsCount}
      />

      {/* Telegram simulator Modal */}
      {isSimOpen && (
        <div className="absolute inset-0 z-[1001] flex bg-transparent">
          {/* Backdrop Tap to close */}
          <div 
            className="absolute inset-0 glass-backdrop" 
            onClick={() => {
              setIsSimOpen(false);
              setSimResult(null);
              setSimText("");
            }} 
          />
          
          <div className="relative glass-drawer rounded-l-[32px] rounded-r-none w-[85%] h-full p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col no-scrollbar animate-slide-in-left z-10">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSimOpen(false);
                  setSimResult(null);
                  setSimText("");
                }}
                className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <MessageSquare size={16} className="text-blue-500" />
                <span>Симулятор Telegram</span>
              </h3>
            </div>

            <p className="text-[10px] text-[#71717a]">
              {language === "ru"
                ? "Введите текст сообщения из чата, чтобы протестировать автоматический парсинг станций и предупреждений."
                : "Enter the text of a chat message to simulate webhook warning ingestion."}
            </p>

            <form onSubmit={handleSimulateTelegram} className="space-y-3 flex-shrink-0">
              <textarea
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="Пример: 'Gossos en Catalunya L3!!' или 'Проверка билетов на выходе из Universitat L1 (mosquits)'"
                rows={3}
                className="w-full bg-[#09090b]/60 border border-white/5 rounded-xl p-3 text-xs text-[#fafafa] placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 font-medium"
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
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-blue-500/20 shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
              >
                <span>Смоделировать парсинг</span>
              </button>
            </form>

            <div className="bg-black/10 border border-white/5 rounded-xl p-3 text-[9px] text-[#71717a] leading-relaxed flex-1 overflow-y-auto no-scrollbar">
              <span className="font-bold text-zinc-500 block mb-0.5">Примеры триггеров:</span>
              <div className="space-y-1">
                <div>• Станции: Catalunya, Sabadell, Badalona, Diagonal, Universitat...</div>
                <div>• Контроль: gossos (собаки), mosquits (гражданские), pregunta (опрос), gorilles (охрана), lliure (чисто)...</div>
                <div>• Задержка: retraso, стоит поезд, задержка...</div>
              </div>
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
