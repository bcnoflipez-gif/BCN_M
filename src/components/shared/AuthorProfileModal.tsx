"use client";

import React, { useState, useEffect } from "react";
import { X, User, Flag, MessageSquare, ShieldAlert, Send, AtSign } from "lucide-react";
import { UserProfileCard, ProfileReactionType } from "../../types";
import { profileService, getOrCreateProfile } from "../../lib/db";

interface AuthorProfileModalProps {
  sessionId: string;
  onClose: () => void;
  language?: string;
}

export default function AuthorProfileModal({ sessionId, onClose, language = "ru" }: AuthorProfileModalProps) {
  const [profile, setProfile] = useState<UserProfileCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<{ heart: number; like: number; dislike: number; myReaction: ProfileReactionType | null }>({
    heart: 0, like: 0, dislike: 0, myReaction: null,
  });

  const mySessionId = getOrCreateProfile().device_session_id;
  const isOwnProfile = sessionId === mySessionId;
  const ru = language === "ru";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await profileService.getPublicProfile(sessionId);
      if (!cancelled) {
        setProfile(data);
        setReactions(profileService.getProfileReactions(sessionId));
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  const handleReact = (type: ProfileReactionType) => {
    if (isOwnProfile) return;
    const updated = profileService.reactToProfile(sessionId, type);
    setReactions(updated);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(ru ? "ru-RU" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return "—"; }
  };

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "?";

  return (
    <div className="absolute inset-0 z-[1100] flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Dimming backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="rounded-t-[28px] shadow-2xl p-4 pb-safe space-y-3 animate-slide-up"
        style={{ background: "linear-gradient(180deg, #111113 0%, #09090b 100%)", border: "1px solid rgba(255,255,255,0.06)", borderBottom: "none" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-1" />

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 text-lg font-extrabold text-zinc-300"
              style={{ background: profile?.avatar_url ? "transparent" : "linear-gradient(135deg,#27272a,#3f3f46)", border: "2px solid rgba(255,255,255,0.08)" }}
            >
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                : <span>{loading ? "?" : initials}</span>
              }
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm leading-tight">
                {loading ? "..." : (profile?.username || ru ? "Неизвестный" : "Unknown")}
              </h3>
              {!loading && profile && (
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {ru ? "С нами с" : "Since"} {formatDate(profile.created_at)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 active:scale-95 transition"
          >
            <X size={14} />
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Bio */}
            {profile.bio && (
              <p className="text-xs text-zinc-300 leading-relaxed rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {profile.bio}
              </p>
            )}

            {/* Social links */}
            {(profile.social_instagram || profile.social_telegram || profile.social_twitter) && (
              <div className="flex gap-2 flex-wrap">
                {profile.social_instagram && (
                  <a
                    href={`https://instagram.com/${profile.social_instagram}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition"
                    style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#f472b6" }}
                  >
                    <span className="text-[10px] font-black">IG</span>
                    @{profile.social_instagram}
                  </a>
                )}
                {profile.social_telegram && (
                  <a
                    href={`https://t.me/${profile.social_telegram}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
                  >
                    <Send size={11} />
                    @{profile.social_telegram}
                  </a>
                )}
                {profile.social_twitter && (
                  <a
                    href={`https://twitter.com/${profile.social_twitter}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition"
                    style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}
                  >
                    <AtSign size={11} />
                    {profile.social_twitter}
                  </a>
                )}
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  icon: <ShieldAlert size={13} className="text-orange-400" />,
                  value: profile.reports_count,
                  label: ru ? "Репортов" : "Reports",
                },
                {
                  icon: <MessageSquare size={13} className="text-blue-400" />,
                  value: profile.comments_count,
                  label: ru ? "Коммент." : "Comments",
                },
                {
                  icon: <Flag size={13} className="text-red-400" />,
                  value: profile.flags_received ?? 0,
                  label: ru ? "Жалоб" : "Flags",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <p className="text-base font-extrabold text-white leading-none">{stat.value}</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Profile reactions */}
            {!isOwnProfile && (
              <div className="border-t border-zinc-800/60 pt-3">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-2 font-bold">
                  {ru ? "Оценить пользователя" : "Rate user"}
                </p>
                <div className="flex gap-2">
                  {(
                    [
                      { type: "heart" as ProfileReactionType, emoji: "❤️", label: ru ? "Нравится" : "Love" },
                      { type: "like" as ProfileReactionType, emoji: "👍", label: ru ? "Лайк" : "Like" },
                      { type: "dislike" as ProfileReactionType, emoji: "👎", label: ru ? "Дизлайк" : "Dislike" },
                    ] as const
                  ).map(item => {
                    const isActive = reactions.myReaction === item.type;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleReact(item.type)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                        style={{
                          background: isActive ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                          border: isActive ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.07)",
                          color: isActive ? "#93c5fd" : "#71717a",
                        }}
                      >
                        <span>{item.emoji}</span>
                        <span>{reactions[item.type] > 0 ? reactions[item.type] : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {isOwnProfile && (
              <p className="text-center text-[10px] text-zinc-600 pb-1">
                {ru ? "Это ваш профиль" : "This is your profile"}
              </p>
            )}
          </>
        )}

        {!loading && !profile && (
          <div className="flex flex-col items-center gap-2 py-6">
            <User size={32} className="text-zinc-700" />
            <p className="text-xs text-zinc-500">{ru ? "Профиль не найден" : "Profile not found"}</p>
          </div>
        )}

        {/* Safe area spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
