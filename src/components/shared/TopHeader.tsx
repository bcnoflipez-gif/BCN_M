import React from "react";
import { ShieldAlert, Train } from "lucide-react";

interface TopHeaderProps {
  activeAlertsCount: number;
}

export default function TopHeader({ activeAlertsCount }: TopHeaderProps) {
  return (
    <header className="sticky top-0 left-0 right-0 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] z-[998] flex items-center justify-between px-4 transition-colors duration-300" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))', height: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
          <Train size={18} className="text-[var(--primary)]" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white flex flex-col">
          <span>BCN Metro Live</span>
          <span className="text-[9px] text-[var(--muted)] font-normal leading-none">Metro & Rodalies</span>
        </span>
      </div>

      {/* Alert Counter */}
      <div className="flex items-center gap-3">
        {activeAlertsCount > 0 && (
          <div className="flex items-center gap-1 bg-red-950/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
            <ShieldAlert size={12} />
            <span>{activeAlertsCount}</span>
          </div>
        )}
      </div>
    </header>
  );
}
