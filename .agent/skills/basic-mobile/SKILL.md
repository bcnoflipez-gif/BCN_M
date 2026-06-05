# Skill: Mobile-First Web-App Architect
# Description: Apply this skill when generating, editing, or refactoring UI components and routing for the mobile web application.

## Core Directives (Принципы разработки)
1. Always prioritize touch targets. All buttons and links must have a minimum clickable area of 44x44px.
2. Use Tailwind CSS with mobile-first breakpoints (assume screen width < 768px by default).
3. Do not use desktop-only hover effects (`hover:`) without checking touch-device compatibility.
4. Keep the bottom of the screen clear for the fixed Bottom Navigation Bar.

## Tech Stack Constraints
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui (Radix Primitives)

## Execution Protocol (Как агент должен выполнять задачи)
1. READ the `architecture.md` file before changing any state management.
2. If installing a new npm package, run `npm audit` automatically.
3. Verify the layout using the integrated browser emulator (set resolution to iPhone 15 Pro dimensions).