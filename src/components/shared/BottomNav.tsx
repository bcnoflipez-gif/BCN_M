import React from "react";
import { Map, List, Heart, User } from "lucide-react";
import { TRANSLATIONS } from "../../lib/translations";
import { Language } from "../../types";

export type TabId = "map" | "list" | "favorites" | "profile";

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  language: Language;
}

export default function BottomNav({ activeTab, onChangeTab, language }: BottomNavProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const navItems = [
    { id: "map" as TabId, label: t.tabs.map, icon: Map },
    { id: "list" as TabId, label: t.tabs.list, icon: List },
    {
      id: "favorites" as TabId,
      label: t.tabs.favorites,
      icon: Heart,
    },
    { id: "profile" as TabId, label: t.tabs.profile, icon: User },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-[999] border-t border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl transition-colors duration-300" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex h-[52px] justify-around items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center h-[52px] w-20 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation ${
                isActive
                  ? "text-[var(--primary)] font-medium"
                  : "text-[var(--muted)] active:text-[var(--muted-foreground)]"
              }`}
              style={{ minHeight: "44px", minWidth: "44px" }}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.25]" : "stroke-[1.75]"
                  }`}
                />
              </div>
              <span className="text-[10px] mt-1 tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
