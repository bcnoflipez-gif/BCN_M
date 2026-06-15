"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const GLOBAL_ERROR_TRANSLATIONS = {
  ru: {
    title: "Критический сбой приложения",
    sub: "Произошла серьезная системная ошибка при инициализации интерфейса.",
    retryBtn: "Перезагрузить приложение",
    details: "Сведения об ошибке"
  },
  en: {
    title: "Critical App Failure",
    sub: "A severe system error occurred during layout initialization.",
    retryBtn: "Reload application",
    details: "System error details"
  },
  es: {
    title: "Fallo crítico de la aplicación",
    sub: "Ocurrió un error grave del sistema durante la inicialización.",
    retryBtn: "Recargar aplicación",
    details: "Detalles del error del sistema"
  },
  fr: {
    title: "Panne critique de l'application",
    sub: "Une erreur système grave s'est produite lors de l'initialisation.",
    retryBtn: "Recharger l'application",
    details: "Détails de l'erreur système"
  }
};

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang] = useState<"ru" | "en" | "es" | "fr">(() => {
    if (typeof window === "undefined") return "ru";
    try {
      const stored = localStorage.getItem("bcn_metro_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language && ["ru", "en", "es", "fr"].includes(parsed.language)) {
          return parsed.language;
        }
      }
    } catch { /* noop */ }
    return "ru";
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Global crash boundary caught layout-level error:", error);
  }, [error]);

  const t = GLOBAL_ERROR_TRANSLATIONS[lang] || GLOBAL_ERROR_TRANSLATIONS.en;

  const handleHardRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <html lang={lang} className="h-full">
      <head>
        <title>System Error — BCN Metro Live</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>{`
          body {
            background-color: #09090b;
            color: #fafafa;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .custom-shadow {
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
          }
          @keyframes alertPulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
          .custom-pulse {
            animation: alertPulse 2s infinite;
          }
        `}</style>
      </head>
      <body className="h-full min-h-screen bg-black flex items-center justify-center p-4">
        
        {/* Mobile max-width screen container wrapper */}
        <div className="w-full max-w-md bg-[#09090b] border border-[#27272a]/60 rounded-[32px] p-6 text-center space-y-6 custom-shadow relative overflow-hidden">
          
          {/* Decorative Glow */}
          <div style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "200px",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            borderRadius: "50%",
            filter: "blur(60px)",
            pointerEvents: "none"
          }} />

          {/* Alert Icon */}
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 relative custom-pulse">
            <ShieldAlert size={36} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-base font-black text-white tracking-tight leading-snug m-0">
              {t.title}
            </h1>
            <p className="text-xs text-[#a1a1aa] leading-relaxed font-medium m-0">
              {t.sub}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                reset();
                handleHardRefresh();
              }}
              style={{
                width: "100%",
                height: "44px",
                background: "linear-gradient(to right, #2563eb, #4f46e5)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                color: "#ffffff",
                fontWeight: "800",
                fontSize: "12px",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              <RefreshCw size={14} />
              <span>{t.retryBtn}</span>
            </button>
          </div>

          {/* Details */}
          <div style={{ borderTop: "1px solid rgba(39, 39, 42, 0.4)", paddingTop: "16px" }} className="text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: "none",
                border: "none",
                padding: "0",
                width: "100%",
                color: "#71717a",
                fontWeight: "700",
                fontSize: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer"
              }}
            >
              <span>{t.details}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div style={{
                marginTop: "12px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid #27272a",
                padding: "12px",
                borderRadius: "12px",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#a1a1aa",
                lineHeight: "1.4",
                wordBreak: "break-all",
                userSelect: "all",
                WebkitUserSelect: "all"
              }}>
                <span style={{ color: "#f87171", fontWeight: "700" }}>
                  {error.name || "LayoutError"}:
                </span>{" "}
                {error.message || "Unknown root layout rendering crash"}
                {error.digest && (
                  <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #1f1f23", color: "#52525b" }}>
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </body>
    </html>
  );
}
