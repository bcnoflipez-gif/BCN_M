"use client";

import { useServerInsertedHTML } from "next/navigation";

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('bcn-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`
        }}
      />
    );
  });
  return null;
}
