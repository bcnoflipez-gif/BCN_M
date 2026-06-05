# SYSTEM INSTRUCTIONS & ENVIRONMENT CONTEXT (GEMINI.md)

## 1. Project Overview & Target
- **Application Type:** Mobile-First Web Application (Web-App / PWA).
- **Target Device Profile:** Smartphone screens (default width < 768px, target baseline: 390x844px).
- **Core Goal:** Deliver a lightweight, highly responsive, touch-optimized web experience.

## 2. Core Technological Stack (Strict Constraints)
You are forbidden to use any libraries or frameworks outside of this core stack unless explicitly requested by the user:
- **Framework:** Next.js 14+ (React, App Router, TypeScript).
- **Styling:** Tailwind CSS (Mobile-first utility-first approach).
- **UI Components:** shadcn/ui (Radix Primitives baseline).
- **Icons:** lucide-react.
- **Database / Backend:** Supabase (PostgreSQL, Auth, Storage).

## 3. Mobile UI/UX Design System Rules
Every time you generate, refactor, or edit UI components, you MUST adhere to these rules:
- **Touch Targets:** Minimum interactive area for buttons, links, and inputs must be 44x44px (use `h-11`, `w-11`, or appropriate padding `p-3` in Tailwind).
- **No Desktop Hovers:** Do not rely on `hover:...` for critical functionality as mobile devices lack hover states. Use `active:...` or focus states for touch feedback.
- **Layout Constraint:** Root page containers MUST use `w-full max-w-md mx-auto min-h-screen bg-background` to ensure the app stays centered and behaves like a native mobile app when viewed on desktop screens.
- **Navigation Layout:** Primary navigation must be a fixed bottom navigation bar (`BottomNav`) with large, clear icons and short labels.
- **Typography:** Ensure font sizes are optimized for mobile. Avoid `text-4xl` or larger for headers to prevent awkward word wrapping on narrow screens; stick to `text-xl` to `text-2xl` for primary headers.

## 4. Repository Directory Structure
Maintain strict architectural hygiene. Do not create unstructured top-level folders.
- `/src/app/` — Next.js App Router (pages, layouts, and API routes).
- `/src/components/ui/` — Atomic UI components (shadcn/ui layout).
- `/src/components/shared/` — Global layout blocks (MobileLayout, BottomNav, TopHeader).
- `/src/hooks/` — Custom React hooks.
- `/src/lib/` — Utility configurations (supabaseClient.ts, utils.ts).
- `/src/types/` — Shared TypeScript definitions and interfaces.

## 5. Workflow Protocols & AI Behavior
1. **Context Verification:** Read this file before initiating any code modification or generation.
2. **Planning Protocol:** Before writing code for any complex task, output a brief step-by-step plan in the chat and wait for user confirmation.
3. **Incremental Code Changes:** Do not rewrite whole files if only a few lines need modification. Use precise, modular edits.
4. **Error Handling:** Wrap all asynchronous operations (API fetches, database queries) in strict `try/catch` blocks. Implement user-friendly mobile notifications (toast messages using `sonner` or shadcn toast).
5. **Code Validation:** Always run syntax and type checks (`npm run lint` or `tsc --noEmit`) internally before declaring a task complete. Never leave unhandled background terminal processes running.

## 6. Security & Stability Guardrails
- NEVER hardcode secrets, API keys, or private tokens. Always use environment variables (`process.env.NEXT_PUBLIC_...`).
- Maintain strict type safety. Avoid the use of `any` in TypeScript.
- Ensure all components are properly optimized for rendering (proper use of `'use client'` vs Server Components).