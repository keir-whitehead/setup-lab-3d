# AGENTS.md — Setup Lab 3D

## Setup
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`

## Validation (run before finishing)
- `npx tsc --noEmit`
- `npm run build` (must produce zero errors)

## Architecture
- Vite + React 18 + TypeScript + React Three Fiber
- `src/App.tsx` — root state management, layout
- `src/components/Scene.tsx` — R3F 3D canvas with GLB model
- `src/components/InfoPanel.tsx` — tab container (specs/ai/costs/cloud)
- `src/components/MachineCard.tsx` — expandable machine config
- `src/components/AIModelTable.tsx` — model compatibility table
- `src/components/CostsPanel.tsx` — ROI/cost breakdown
- `src/components/CloudPanel.tsx` — cloud services
- `src/components/MonitorCard.tsx` — monitor info
- `src/data/machines.ts` — machine definitions
- `src/data/aiModels.ts` — AI model definitions + calculation logic
- `src/data/monitors.ts` — monitor definitions
- `src/types/index.ts` — all TypeScript types + chip config constants
- `public/models/setup_lab.glb` — 3D desk scene (DO NOT MODIFY)

## Conventions
- No external CSS — all inline styles (current pattern)
- Dark theme (#0a0a1a base)
- Accent: indigo (#818cf8)
- Font: system + JetBrains Mono for numbers
- No new dependencies unless absolutely necessary
- Fix ALL type errors. No @ts-ignore. strict: true.
