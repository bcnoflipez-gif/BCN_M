"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, Heart, Accessibility, ArrowRightLeft, Info, 
  MessageSquare, ShieldAlert, Trash2, Send, Flag, 
  User, Clock, AlertTriangle, Users, HelpCircle, 
  Smile
} from "lucide-react";
import { Station, METRO_LINES } from "../../lib/metroData";
import { StationComment, StationReport, ReportType, EmojiType, Language } from "../../types";
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
  const [comments, setComments] = useState<StationComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentCooldown, setCommentCooldown] = useState<number>(0);
  const [reportCooldown, setReportCooldown] = useState<number>(0);
  
  // Active warning status type clicked by the user
  const [clickedDescriptionType, setClickedDescriptionType] = useState<ReportType | null>(null);

  // Active Alert micro-description toggles
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const profile = getOrCreateProfile();
  const currentSessionId = profile.device_session_id;
  const t = TRANSLATIONS[language];

  // Fetch comments when station changes
  const loadComments = useCallback(async () => {
    if (station) {
      const data = await dbService.getComments(station.id);
      setComments(data);
    }
  }, [station]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments();
    setClickedDescriptionType(null);
  }, [loadComments]);

  // Handle cooldown timers
  useEffect(() => {
    const timer = setInterval(() => {
      const comCheck = spamProtection.checkCommentCooldown();
      setCommentCooldown(comCheck.remainingSec);

      const repCheck = spamProtection.checkReportCooldown();
      setReportCooldown(repCheck.remainingSec);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 z-[1000] glass-panel rounded-t-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 ease-out border-t border-[#27272a] flex flex-col no-scrollbar"
      style={{ height: "60vh", maxHeight: "550px" }}
    >
      {/* Handlebar for visual drag indicator */}
      <div className="w-12 h-1 bg-[#27272a] rounded-full mx-auto my-3 flex-shrink-0" />

      {/* Header section */}
      <div className="px-4 pb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {station.lines.map(lineId => {
              const line = METRO_LINES[lineId];
              return (
                <span 
                  key={lineId}
                  className="px-2 py-0.5 rounded text-[10px] font-bold shadow-sm"
                  style={{ backgroundColor: line?.color || "#52525b", color: line?.textColor || "#fff" }}
                >
                  {line?.name || lineId}
                </span>
              );
            })}
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{station.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle button */}
          <button 
            onClick={onToggleFavorite}
            className={`h-11 w-11 rounded-full flex items-center justify-center border active:scale-95 transition-all duration-200 ${
              isFavorite 
                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                : "bg-[#18181b]/55 border-[#27272a] text-[#71717a] active:text-[#a1a1aa]"
            }`}
            aria-label={t.station.favoriteBtn}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Close button */}
          <button 
            onClick={onClose}
            className="h-11 w-11 rounded-full bg-[#18181b]/55 border border-[#27272a] flex items-center justify-center text-[#71717a] active:text-[#a1a1aa] active:scale-95 transition-all"
            aria-label={t.common.close}
          >
            <X size={20} />
          </button>
        </div>
      </div>

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
        {activeTab === "info" && (
          <div className="space-y-4">
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
              <h3 className="text-xs font-bold text-[#71717a] uppercase tracking-widest">{t.station.about}</h3>
              
              <p className="text-xs text-[#fafafa] leading-relaxed font-medium">
                {language === "ru" ? station.generalInfo.infoTextRu : station.generalInfo.infoTextEn}
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
  );
}
