import React from "react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-stretch font-sans antialiased select-none">
      {/* 
        This wrapper behaves like a physical phone container on desktop, 
        but takes 100% width on actual mobile screens.
      */}
      <div className="w-full max-w-md bg-[#09090b] text-[#f4f4f5] border-x border-[#18181b] shadow-2xl relative flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
