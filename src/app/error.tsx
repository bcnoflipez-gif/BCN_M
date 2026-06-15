"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

const ERROR_TRANSLATIONS = {
  ru: {
    title: "Что-то пошло не так",
    sub: "Произошла непредвиденная ошибка в работе приложения.",
    retryBtn: "Попробовать снова",
    homeBtn: "На главную",
    details: "Детали ошибки (для разработчиков)",
    digest: "Дайджест ошибки:"
  },
  en: {
    title: "Something went wrong",
    sub: "An unexpected error occurred while running the application.",
    retryBtn: "Try again",
    homeBtn: "Go Home",
    details: "Error details (for developers)",
    digest: "Error digest:"
  },
  es: {
    title: "Algo salió mal",
    sub: "Ocurrió un error inesperado al ejecutar la aplicación.",
    retryBtn: "Intentar de nuevo",
    homeBtn: "Ir al inicio",
    details: "Detalles del error (para desarrolladores)",
    digest: "Resumen del error:"
  },
  fr: {
    title: "Quelque chose s'est mal passé",
    sub: "Une erreur inattendue s'est produite lors de l'exécution de l'application.",
    retryBtn: "Réessayer",
    homeBtn: "Retour à l'accueil",
    details: "Détails de l'erreur (pour les développeurs)",
    digest: "Résumé de l'erreur:"
  }
};

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang] = useState<"ru" | "en" | "es" | "fr">(() => {
    if (typeof window === "undefined") return "ru";
    try {
      const storedProfile = localStorage.getItem("bcn_metro_profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.language && ["ru", "en", "es", "fr"].includes(parsed.language)) {
          return parsed.language;
        }
      }
    } catch { /* noop */ }
    return "ru";
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error for tracking
    console.error("Route error boundary caught an exception:", error);

    // Synchronize theme from localStorage
    try {
      const storedTheme = localStorage.getItem("bcn-theme");
      if (storedTheme) {
        document.documentElement.setAttribute("data-theme", storedTheme);
      }
    } catch (e) {
      console.warn("Error restoring profile/theme settings inside error boundary:", e);
    }
  }, [error]);

  const t = ERROR_TRANSLATIONS[lang] || ERROR_TRANSLATIONS.en;

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[var(--background)] text-[var(--foreground)] px-5 py-8 flex flex-col justify-center items-stretch font-sans relative overflow-hidden border-x border-[var(--border)] shadow-2xl transition-colors duration-300">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Glass Panel Card */}
      <div className="glass-card rounded-3xl p-6 border border-[var(--border)]/80 space-y-6 w-full shadow-2xl bg-[var(--card)]/40 backdrop-blur-xl flex flex-col items-center text-center relative z-10">
        
        {/* Animated Warning Icon with soft pulse glow */}
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 relative shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-alert-pulse">
          <ShieldAlert size={36} />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-white tracking-tight leading-snug">
            {t.title}
          </h2>
          <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium">
            {t.sub}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(59,130,246,0.25)] border border-blue-500/20 cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>{t.retryBtn}</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full h-11 bg-zinc-900 border border-[#27272a] hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Home size={14} />
            <span>{t.homeBtn}</span>
          </button>
        </div>

        {/* Debug Drawer Summary */}
        <div className="w-full border-t border-[var(--border)]/60 pt-4 flex flex-col items-stretch text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between text-[10px] font-bold text-zinc-500 hover:text-zinc-400 select-none cursor-pointer"
          >
            <span className="uppercase tracking-wider">{t.details}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div className="mt-3 bg-[#09090b]/60 border border-[var(--border)] p-3 rounded-xl space-y-2 text-[10px] font-mono text-zinc-400 break-all select-all leading-normal">
              <div className="text-red-400 font-bold">
                {error.name || "Error"}: {error.message || "Unknown error"}
              </div>
              {error.digest && (
                <div className="pt-1.5 border-t border-zinc-800 text-zinc-500">
                  <span className="font-bold mr-1">{t.digest}</span>
                  {error.digest}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
