import React from "react";
import { ShieldAlert, Train, CloudOff, CloudLightning } from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabaseClient";

interface TopHeaderProps {
  activeAlertsCount: number;
}

export default function TopHeader({ activeAlertsCount }: TopHeaderProps) {
  return (
    <header className="sticky top-0 left-0 right-0 h-14 bg-[#09090b]/80 backdrop-blur-md border-b border-[#18181b] z-[998] flex items-center justify-between px-4">
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
          <Train size={18} className="text-blue-500" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white flex flex-col">
          <span>BCN Metro Live</span>
          <span className="text-[9px] text-[#71717a] font-normal leading-none">Metro & Rodalies</span>
        </span>
      </div>

      {/* Database Mode and Alert Counter */}
      <div className="flex items-center gap-3">
        {/* Supabase status indicator */}
        <div 
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${
            isSupabaseConfigured
              ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
              : "bg-amber-950/20 text-amber-400 border-amber-500/20"
          }`}
          title={isSupabaseConfigured ? "Connected to Supabase" : "Running in Local Offline Mode"}
        >
          {isSupabaseConfigured ? (
            <>
              <CloudLightning size={10} />
              <span>Cloud</span>
            </>
          ) : (
            <>
              <CloudOff size={10} />
              <span>Local</span>
            </>
          )}
        </div>

        {/* Warning Badge */}
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
