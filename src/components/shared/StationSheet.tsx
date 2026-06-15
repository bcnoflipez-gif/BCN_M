"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Heart, Accessibility, ArrowRightLeft, Info, 
  MessageSquare, ShieldAlert, Trash2, Send, Flag, 
  User, Clock, AlertTriangle, Users, HelpCircle, 
  Smile, ArrowLeft
} from "lucide-react";
import { Station, METRO_LINES } from "../../lib/metroData";
import { StationComment, StationReport, ReportType, EmojiType, Language, StationOverride } from "../../types";
import { dbService, spamProtection, getOrCreateProfile } from "../../lib/db";
import { TRANSLATIONS } from "../../lib/translations";

interface StationSheetProps {
  station: Station | null;
  onClose: () => void;
  activeReports: StationReport[];
  onReportAdded: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  language: Language;
}

type SheetTab = "info" | "comments";

export default function StationSheet({
  station,
  onClose,
  activeReports,
  onReportAdded,
  isFavorite,
  onToggleFavorite,
  language
}: StationSheetProps) {
  const [activeTab, setActiveTab] = useState<SheetTab>("info");
  const [sheetState, setSheetState] = useState<"peek" | "expanded">("peek");
  const [comments, setComments] = useState<StationComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentCooldown, setCommentCooldown] = useState<number>(0);
  const [reportCooldown, setReportCooldown] = useState<number>(0);
  
  // Active warning status type clicked by the user
  const [clickedDescriptionType, setClickedDescriptionType] = useState<ReportType | null>(null);

  // Active Alert micro-description toggles
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Station Override states
  const [override, setOverride] = useState<StationOverride | null>(null);
  const [isEditingOverride, setIsEditingOverride] = useState(false);
  const [editInfoRu, setEditInfoRu] = useState("");
  const [editInfoEn, setEditInfoEn] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const profile = getOrCreateProfile();
  const currentSessionId = profile.device_session_id;
  const t = TRANSLATIONS[language];
  const isAdmin = profile?.role === "admin";

  // Fetch comments when station changes
  const loadComments = useCallback(async () => {
    if (station) {
      const data = await dbService.getComments(station.id);
      setComments(data);
    }
  }, [station]);

  const loadOverride = useCallback(async () => {
    if (!station) return;
    try {
      const overrides = await dbService.getStationOverrides();
      const matched = overrides.find(o => o.station_id === station.id);
      setOverride(matched || null);
    } catch (err) {
      console.error("Failed to load overrides:", err);
    }
  }, [station]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments();
    loadOverride();
    setClickedDescriptionType(null);
    setIsEditingOverride(false);
    // Reset to peek whenever station changes
    setSheetState("peek");
  }, [loadComments, loadOverride]);


  // Handle cooldown timers
  useEffect(() => {
    const timer = setInterval(() => {
      const comCheck = spamProtection.checkCommentCooldown(isAdmin);
      setCommentCooldown(comCheck.remainingSec);

      const repCheck = spamProtection.checkReportCooldown(isAdmin);
      setReportCooldown(repCheck.remainingSec);
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdmin]);

  const startEditing = () => {
    setEditInfoRu(override?.info_text_ru || station?.generalInfo.infoTextRu || "");
    setEditInfoEn(override?.info_text_en || station?.generalInfo.infoTextEn || "");
    setEditPhotoUrl(override?.photo_url || "");
    setIsEditingOverride(true);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;
    setSaveLoading(true);
    try {
      const success = await dbService.saveStationOverride(
        station.id,
        editInfoRu,
        editInfoEn,
        editPhotoUrl
      );
      if (success) {
        await loadOverride();
        setIsEditingOverride(false);
      }
    } catch (err) {
      console.error("Failed to save override:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (!station) return null;

  const handleStatusUpdate = async (status: ReportType) => {
    setClickedDescriptionType(status);
    setCommentError(null);

    // Spam Protection: check report cooldown
    const cooldownCheck = spamProtection.checkReportCooldown();
    if (!cooldownCheck.allowed) {
      setCommentError(`${t.report.cooldownWait} ${cooldownCheck.remainingSec}s.`);
      return;
    }

    // Add status report
    const report = await dbService.addReport(station.id, status, "");
    if (report) {
      spamProtection.recordReportSent();
      onReportAdded();
    } else {
      setCommentError(t.report.error);
    }
  };

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    const hasText = newCommentText.trim().length > 0;
    if (!hasText) return;

    // Spam Protection: check comment cooldown
    const cooldownCheck = spamProtection.checkCommentCooldown();
    if (!cooldownCheck.allowed) {
      setCommentError(`${t.report.cooldownWait} ${cooldownCheck.remainingSec}s.`);
      return;
    }

    // Spam Protection: check content validation
    const contentCheck = spamProtection.validateContent(newCommentText);
    if (!contentCheck.valid) {
      setCommentError(contentCheck.reason || "Invalid comment");
      return;
    }

    // Submit Comment
    const comment = await dbService.addComment(station.id, newCommentText);
    if (comment) {
      spamProtection.recordCommentSent();
      setNewCommentText("");
      loadComments();
    } else {
      setCommentError(t.report.error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await dbService.deleteComment(commentId);
    if (success) {
      loadComments();
    }
  };

  const handleReactToComment = async (commentId: string, emoji: EmojiType) => {
    await dbService.reactToComment(commentId, emoji);
    loadComments();
  };

  const handleFlagComment = async (commentId: string) => {
    await dbService.flagComment(commentId);
    loadComments();
  };

  // Filter active warnings for this station
  const stationWarnings = activeReports.filter(r => r.station_id === station.id);
  const activeWarning = stationWarnings[0] || {
    id: "virtual_lliure_" + station.id,
    station_id: station.id,
    type: "lliure" as const,
    description: t.station.noAlerts,
    created_at: new Date().toISOString(),
    expires_at: new Date().toISOString(),
  };
  const currentDescriptionType = clickedDescriptionType || activeWarning.type || null;

  // Translate report types & map subtypes
  const getReportTypeInfo = (type: ReportType) => {
    switch(type) {
      case "gossos": 
        return { 
          label: t.controls.gossos.label, 
          desc: t.controls.gossos.desc, 
          icon: ShieldAlert, 
          color: "text-red-500 bg-red-500/10 border-red-500/20" 
        };
      case "mosquits": 
        return { 
          label: t.controls.mosquits.label, 
          desc: t.controls.mosquits.desc, 
          icon: ShieldAlert, 
          color: "text-rose-500 bg-rose-500/10 border-rose-500/20" 
        };
      case "pregunta": 
        return { 
          label: t.controls.pregunta.label, 
          desc: t.controls.pregunta.desc, 
          icon: HelpCircle, 
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
        };
      case "gorilles": 
        return { 
          label: t.controls.gorilles.label, 
          desc: t.controls.gorilles.desc, 
          icon: ShieldAlert, 
          color: "text-red-400 bg-red-400/10 border-red-500/20" 
        };
      case "lliure": 
        return { 
          label: t.controls.lliure.label, 
          desc: t.controls.lliure.desc, 
          icon: Smile, 
          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
        };
      case "delay": 
        return { 
          label: language === "ru" ? "Задержка поезда" : language === "es" ? "Retraso de tren" : language === "fr" ? "Retard de train" : "Train Delay", 
          desc: language === "ru" ? "Поезда задерживаются или стоят в туннеле." : "Trains are experiencing delays or stopped.", 
          icon: Clock, 
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
        };
      case "crowd": 
        return { 
          label: language === "ru" ? "Толпа / Давка" : language === "es" ? "Aglomeración / Colas" : language === "fr" ? "Foule / Affluence" : "Crowd / High Traffic", 
          desc: language === "ru" ? "Очень высокая заполненность станции или очереди." : "High passenger density or long queues.", 
          icon: Users, 
          color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" 
        };
      case "security": 
        return { 
          label: language === "ru" ? "Карманники / Кражи" : language === "es" ? "Carteristas / Robos" : language === "fr" ? "Vols / Pickpockets" : "Security Alert / Theft", 
          desc: language === "ru" ? "В районе станции замечены карманные воры." : "Pickpockets have been spotted active nearby.", 
          icon: AlertTriangle, 
          color: "text-rose-500 bg-rose-500/10 border-rose-500/20" 
        };
      default: 
        return { 
          label: language === "ru" ? "Прочее происшествие" : "Other Incident", 
          desc: "General alert reported by commuter.", 
          icon: HelpCircle, 
          color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" 
        };
    }
  };

  // ── Drag / swipe logic ──────────────────────────────────────────────────
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const isDragging = useRef(false);
  const SNAP_THRESHOLD = 40; // px — lower = easier to trigger

  const onPointerDown = (e: React.PointerEvent) => {
    // Don't capture if user clicked a button — let click events through
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    dragStartY.current = e.clientY;
    dragCurrentY.current = e.clientY;
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    dragCurrentY.current = e.clientY;
  };

  const onPointerUp = () => {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = dragCurrentY.current - dragStartY.current;
    isDragging.current = false;

    if (delta < -SNAP_THRESHOLD) {
      // Swipe UP → expand
      setSheetState("expanded");
    } else if (delta > SNAP_THRESHOLD) {
      if (sheetState === "expanded") {
        // Swipe DOWN from expanded → return to peek
        setSheetState("peek");
      } else {
        // Swipe DOWN from peek → close
        onClose();
      }
    }
    dragStartY.current = null;
  };
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className={`absolute z-[1000] flex flex-col pointer-events-none ${
      sheetState === "expanded" ? "inset-0" : "inset-x-0 bottom-0"
    }`}>
      {/* Backdrop — only in expanded mode */}
      {sheetState === "expanded" && (
        <div
          className="flex-1 pointer-events-auto"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet Panel */}
      <div
        className={`relative glass-sheet shadow-2xl flex flex-col no-scrollbar pointer-events-auto sheet-snap rounded-t-[28px] ${
          sheetState !== "expanded" ? "animate-slide-up" : ""
        }`}
        style={{
          height: sheetState === "expanded" ? "100%" : "calc(45% + 64px)",
          paddingBottom: sheetState === "expanded" ? 0 : "64px",
          maxHeight: sheetState === "expanded" ? "100%" : undefined,
        }}
      >
        {/* Drag Handle + Header — unified swipe zone */}
        <div
          className="flex-shrink-0 drag-handle-zone cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Pill handle */}
          <div className="flex justify-center pt-2.5 pb-2">
            <div className="w-10 h-1 rounded-full bg-white/25" />
          </div>

          {/* Header section */}
          <div className="px-4 pb-2 flex items-center gap-3 border-b border-[#18181b]">
          {/* Back / close button */}
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-[#18181b]/55 border border-[#27272a] flex items-center justify-center text-[#71717a] active:text-[#a1a1aa] active:scale-95 transition-all"
            aria-label={t.common.close}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-white tracking-tight truncate">{station.name}</h2>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {station.lines.map(lineId => {
                const line = METRO_LINES[lineId];
                return (
                  <span 
                    key={lineId}
                    className="px-1.5 py-0.5 rounded text-[8px] font-black"
                    style={{ backgroundColor: line?.color || "#52525b", color: line?.textColor || "#fff" }}
                  >
                    {line?.name || lineId}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Favorite Toggle button */}
          <button 
            onClick={onToggleFavorite}
            className={`h-10 w-10 rounded-xl flex items-center justify-center border active:scale-95 transition-all duration-200 ${
              isFavorite 
                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                : "bg-[#18181b]/55 border-[#27272a] text-[#71717a] active:text-[#a1a1aa]"
            }`}
            aria-label={t.station.favoriteBtn}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          </div>
        </div> {/* end drag-handle-zone */}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#18181b] px-2 flex-shrink-0">
        {(["info", "comments"] as SheetTab[]).map(tab => {
          let label = "";
          let icon = null;
          if (tab === "info") { label = t.common.all; icon = <Info size={14} />; }
          else { label = `${t.station.commentsCount} (${comments.length})`; icon = <MessageSquare size={14} />; }

          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-200 ${
                isActive 
                  ? "border-blue-500 text-blue-400" 
                  : "border-transparent text-[#71717a] active:text-[#a1a1aa]"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {/* TAB 1: INFO */}
        {/* TAB 1: INFO */}
        {activeTab === "info" && (
          isEditingOverride ? (
            <form onSubmit={handleSaveOverride} className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest pl-0.5">
                  {language === "ru" ? "Редактирование" : "Edit Details"}
                </h3>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">
                  {language === "ru" ? "Описание (Русский)" : "Description (Russian)"}
                </label>
                <textarea
                  value={editInfoRu}
                  onChange={(e) => setEditInfoRu(e.target.value)}
                  rows={3}
                  className="w-full bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/85 rounded-xl p-3 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">
                  {language === "ru" ? "Описание (Английский)" : "Description (English)"}
                </label>
                <textarea
                  value={editInfoEn}
                  onChange={(e) => setEditInfoEn(e.target.value)}
                  rows={3}
                  className="w-full bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/85 rounded-xl p-3 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">
                  {language === "ru" ? "Ссылка на фото" : "Photo URL"}
                </label>
                <input
                  type="url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full h-11 bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/85 rounded-xl px-3.5 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(59,130,246,0.25)] border border-blue-500/20"
                >
                  {saveLoading && (
                    <div className="h-4 w-4 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  )}
                  <span>{language === "ru" ? "Сохранить" : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOverride(false)}
                  className="w-full h-11 bg-zinc-900 border border-[#27272a] hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-xs flex items-center justify-center active:scale-95 transition-all"
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Active Alerts */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-0.5">
                  {language === "ru" ? "Текущий статус" : "Current Status"}
                </h3>
                {(() => {
                  const warning = activeWarning;
                  const info = getReportTypeInfo(warning.type);
                  const WarningIcon = info.icon;
                  const isVirtual = warning.id.startsWith("virtual_");
                  const minutesAgo = Math.floor((new Date().getTime() - new Date(warning.created_at).getTime()) / 60000);
                  const timeText = isVirtual 
                    ? "" 
                    : minutesAgo <= 1 ? t.station.justNow : `${minutesAgo} ${t.station.minutesAgo}`;
                  const isExpanded = expandedAlertId === warning.id;

                  return (
                    <div 
                      onClick={() => setExpandedAlertId(isExpanded ? null : warning.id)}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer active:scale-[0.99] transition-all ${info.color}`}
                    >
                      <div className="flex items-start gap-3">
                        <WarningIcon size={18} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold text-xs">{info.label}</span>
                            {!isVirtual && (
                              <span className="text-[10px] opacity-70 flex items-center gap-0.5">
                                <Clock size={10} />
                                {timeText}
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed font-medium">
                            {warning.description}
                          </p>
                        </div>
                      </div>

                      {/* Localized Micro-description overlay */}
                      {isExpanded && info.desc && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] opacity-80 leading-normal flex items-start gap-1">
                          <Info size={12} className="flex-shrink-0 mt-0.5" />
                          <span>{info.desc}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* General Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest pl-0.5">{t.station.about}</h3>
                  {isAdmin && (
                    <button
                      onClick={startEditing}
                      className="h-8 px-3 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 text-[10px] font-extrabold active:scale-95 transition-all"
                    >
                      {language === "ru" ? "Редактировать" : "Edit Info"}
                    </button>
                  )}
                </div>

                {override?.photo_url && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#27272a]/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={override.photo_url} 
                      alt={station.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <p className="text-xs text-[#fafafa] leading-relaxed font-medium">
                  {language === "ru" 
                    ? (override?.info_text_ru || station.generalInfo.infoTextRu) 
                    : (override?.info_text_en || station.generalInfo.infoTextEn)}
                </p>

                {/* Grid of features */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-[#18181b]/45 border border-[#27272a] p-2.5 rounded-xl">
                    <Accessibility size={16} className={station.generalInfo.accessibility ? "text-blue-400" : "text-zinc-600"} />
                    <div className="text-left">
                      <p className="text-[10px] text-[#71717a] leading-none">{t.station.accessibility}</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">
                        {station.generalInfo.accessibility ? t.common.yes : t.common.no}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#18181b]/45 border border-[#27272a] p-2.5 rounded-xl">
                    <ArrowRightLeft size={16} className={station.generalInfo.escalators ? "text-blue-400" : "text-zinc-600"} />
                    <div className="text-left">
                      <p className="text-[10px] text-[#71717a] leading-none">{t.station.escalators}</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">
                        {station.generalInfo.escalators ? t.common.yes : t.common.no}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transfers */}
                {station.generalInfo.transfers !== "None" && (
                  <div className="bg-[#18181b]/20 border border-[#27272a]/30 p-2.5 rounded-xl text-xs">
                    <span className="font-bold text-[#71717a] block mb-1">{t.station.transfers}:</span>
                    <span className="text-[#a1a1aa] font-medium">{station.generalInfo.transfers}</span>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* TAB 2: COMMENTS & STATUS UPDATES */}
        {activeTab === "comments" && (
          <div className="space-y-4 flex flex-col h-full">

            {/* Current Status Badge inside Community tab */}
            <div className="space-y-1.5 flex-shrink-0">
              <span className="text-[9px] font-extrabold text-[#71717a] uppercase tracking-wider pl-1">
                {language === "ru" ? "Текущий статус станции" : language === "es" ? "Estado actual" : language === "fr" ? "Statut actuel" : "Current Status"}
              </span>
              {(() => {
                const warning = activeWarning;
                const info = getReportTypeInfo(warning.type);
                const WarningIcon = info.icon;
                const isVirtual = warning.id.startsWith("virtual_");
                const minutesAgo = Math.floor((new Date().getTime() - new Date(warning.created_at).getTime()) / 60000);
                const timeText = isVirtual 
                  ? "" 
                  : minutesAgo <= 1 ? t.station.justNow : `${minutesAgo} ${t.station.minutesAgo}`;

                return (
                  <div 
                    onClick={() => setExpandedAlertId(expandedAlertId === warning.id ? null : warning.id)}
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 cursor-pointer active:scale-[0.99] transition-all ${info.color}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <WarningIcon size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold text-xs">{info.label}</span>
                          {!isVirtual && (
                            <span className="text-[9px] opacity-75 flex items-center gap-0.5">
                              <Clock size={8} />
                              {timeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed font-medium">
                          {warning.description}
                        </p>
                      </div>
                    </div>

                    {expandedAlertId === warning.id && info.desc && (
                      <div className="pt-2 border-t border-white/10 text-[10px] opacity-80 leading-normal flex items-start gap-1">
                        <Info size={12} className="flex-shrink-0 mt-0.5" />
                        <span>{info.desc}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Warning Status Selection Buttons */}
            <div className="space-y-2 flex-shrink-0 border-t border-[#18181b]/50 pt-2.5">
              <span className="text-[9px] font-extrabold text-[#71717a] uppercase tracking-wider pl-1">
                {language === "ru"
                  ? reportCooldown > 0 ? `Подождите ${reportCooldown}с перед обновлением` : "Обновить статус (актуально 2 часа)"
                  : language === "es"
                  ? reportCooldown > 0 ? `Espera ${reportCooldown}s para actualizar` : "Actualizar estado (activo 2h)"
                  : language === "fr"
                  ? reportCooldown > 0 ? `Attendez ${reportCooldown}s` : "Mettre à jour l'état (actif 2h)"
                  : reportCooldown > 0 ? `Wait ${reportCooldown}s before updating` : "Update Status (Active for 2h)"}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { id: "gossos" as ReportType, label: "👮" },
                  { id: "mosquits" as ReportType, label: "📛" },
                  { id: "pregunta" as ReportType, label: "❔" },
                  { id: "gorilles" as ReportType, label: "🦺" },
                  { id: "lliure" as ReportType, label: "💚" },
                  { id: "delay" as ReportType, label: "⏳" },
                  { id: "crowd" as ReportType, label: "👥" },
                  { id: "security" as ReportType, label: "⚠️" }
                ]).map(type => {
                  const currentActiveReport = stationWarnings[0];
                  const isSelected = currentActiveReport?.type === type.id;
                  const info = getReportTypeInfo(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleStatusUpdate(type.id)}
                      disabled={reportCooldown > 0}
                      className={`h-11 rounded-xl border text-sm flex items-center justify-center transition-all duration-200 active:scale-90 ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                          : "bg-[#18181b]/45 border-[#27272a]/60 text-zinc-400 hover:border-zinc-700 disabled:opacity-40"
                      }`}
                      title={info.label}
                      aria-label={info.label}
                    >
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
 
              {/* Status explanation description details */}
              {currentDescriptionType && (
                <div className="bg-[#121214]/50 border border-[#27272a]/40 rounded-xl p-2.5 text-[10px] leading-relaxed text-[#a1a1aa] flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-inner">
                  <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block mb-0.5">
                      {getReportTypeInfo(currentDescriptionType).label}
                    </span>
                    <span>
                      {getReportTypeInfo(currentDescriptionType).desc}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommunitySubmit} className="space-y-2 flex-shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => {
                    setNewCommentText(e.target.value);
                    setCommentError(null);
                  }}
                  placeholder={
                    commentCooldown > 0 
                      ? `${t.report.cooldownWait} ${commentCooldown}s` 
                      : t.station.addCommentPlaceholder
                  }
                  disabled={commentCooldown > 0}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-3.5 pr-12 py-2.5 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500/60 disabled:opacity-50 font-medium h-11"
                />
                <button 
                  type="submit" 
                  disabled={!newCommentText.trim() || commentCooldown > 0}
                  className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              {commentError && (
                <div className="text-[10px] text-red-400 font-bold bg-red-950/20 border border-red-500/20 px-2.5 py-1.5 rounded">
                  {commentError}
                </div>
              )}
            </form>

            {/* List of comments */}
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map(comment => {
                  const isAuthor = comment.author_session_id === currentSessionId;
                  const dateStr = new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const reactions = comment.reactions || { like: [], dislike: [], cop: [], warning: [] };

                  return (
                    <div 
                      key={comment.id}
                      className="bg-[#18181b]/35 border border-[#27272a]/60 rounded-xl p-3 space-y-2.5 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center">
                            <User size={10} className="text-[#a1a1aa]" />
                          </div>
                          <span className={`text-[11px] font-bold ${isAuthor ? "text-blue-400" : "text-[#f4f4f5]"}`}>
                            {comment.author_name} {isAuthor && (language === "ru" ? "(Вы)" : "(You)")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-[#71717a]">{dateStr}</span>
                          
                          <button 
                            onClick={() => handleFlagComment(comment.id)}
                            className="text-[#71717a] hover:text-red-400 p-0.5 rounded transition"
                            title={t.station.flagBtn}
                          >
                            <Flag size={10} />
                          </button>

                          {isAuthor && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-600 p-0.5 rounded transition"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#fafafa] leading-relaxed break-words font-medium">
                        {comment.text}
                      </p>

                      {/* Reactions */}
                      <div className="flex gap-2">
                        {([
                          { type: "like" as EmojiType, label: "👍" },
                          { type: "dislike" as EmojiType, label: "👎" },
                          { type: "cop" as EmojiType, label: "👮" },
                          { type: "warning" as EmojiType, label: "⏳" }
                        ]).map(item => {
                          const usersReacted = reactions[item.type] || [];
                          const hasReacted = usersReacted.includes(currentSessionId);
                          const count = usersReacted.length;

                          return (
                            <button
                              key={item.type}
                              onClick={() => handleReactToComment(comment.id, item.type)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs transition active:scale-90 ${
                                hasReacted
                                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold"
                                  : "bg-[#18181b]/55 border-[#27272a] text-[#71717a]"
                              }`}
                            >
                              <span>{item.label}</span>
                              {count > 0 && <span className="text-[10px]">{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-[#71717a]">
                  {t.station.noComments}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
