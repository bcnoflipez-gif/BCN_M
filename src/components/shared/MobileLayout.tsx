import React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="h-full w-full bg-black flex justify-center items-stretch font-sans antialiased select-none overflow-hidden">
      {/* 
        This wrapper behaves like a physical phone container on desktop, 
        but takes 100% width on actual mobile screens.
        Uses solid height percentage to guarantee bottom safe area coverage.
      */}
      <div className="w-full max-w-md bg-[var(--background)] text-[var(--foreground)] border-x border-[var(--border)] shadow-2xl relative flex flex-col h-full overflow-hidden transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
