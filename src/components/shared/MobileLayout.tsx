import React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex justify-center items-stretch font-sans antialiased select-none">
      {/* 
        This wrapper behaves like a physical phone container on desktop, 
        but takes 100% width on actual mobile screens.
        Uses dvh (dynamic viewport height) for proper standalone PWA behavior.
      */}
      <div className="w-full max-w-md bg-[var(--background)] text-[var(--foreground)] border-x border-[var(--border)] shadow-2xl relative flex flex-col min-h-[100dvh] transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
