"use client";

import React, { useState, useEffect } from "react";

const DEFAULT_TICKER =
  "🚇 BCN Metro Live — seguimiento en tiempo real · BCN Metro Live — real-time station tracker";

interface TickerBannerProps {
  // Kept for backward compat with existing TopHeader usage
  activeAlertsCount?: number;
}

export default function TickerBanner({ activeAlertsCount: _ignored }: TickerBannerProps) {
  const [text, setText] = useState(DEFAULT_TICKER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bcn_ticker");
      if (saved && saved.trim()) {
        setText(saved);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bcn_ticker" && e.newValue) setText(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div
      className="w-full overflow-hidden bg-[#0c0c0e] border-b border-white/[0.06] flex-shrink-0"
      style={{ height: "calc(36px + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}
      aria-label="Ticker"
    >
      <div className="flex items-center h-full">
        <span className="ticker-track text-[10px] font-semibold text-zinc-400 tracking-wide">
          <span className="pr-20">{text}</span>
          <span className="pr-20">{text}</span>
        </span>
      </div>
    </div>
  );
}
