# Setup Lab 3D

3D hardware desk configurator built with React Three Fiber. Visualise and configure Apple Silicon machines, monitors, and AI model compatibility.

## Setup

```bash
cd setup-lab-3d
npm install
npm run dev
```

## Features

- **3D desk scene** — GLB model with orbit controls
- **Click to select** — Click machines/monitors in 3D or sidebar to view specs
- **Toggle machines** — Enable/disable MacBook Air, Mac Mini, Mac Studio, MacBook Pro
- **AI model compatibility** — Shows which local models run on your active config
- **Cloud services** — Claude Opus 4.6, OpenAI Codex reference
- **Total RAM counter** — Live combined RAM of active machines

## Tech Stack

- Vite + React + TypeScript (strict)
- @react-three/fiber + @react-three/drei
- Three.js GLB model loading

## Structure

```
src/
  components/
    Scene.tsx        — 3D canvas, GLB loading, orbit controls, click selection
    InfoPanel.tsx    — Right sidebar with tabs
    MachineCard.tsx  — Machine spec card with toggle
    MonitorCard.tsx  — Monitor spec card
    AIModelTable.tsx — AI model compatibility table
    CloudPanel.tsx   — Cloud service cards
  data/
    machines.ts      — Machine definitions
    monitors.ts      — Monitor definitions
    aiModels.ts      — AI model defs, cloud services, getAIModels()
  types/
    index.ts         — TypeScript interfaces
  App.tsx            — Main layout (70/30 split)
  main.tsx           — Entry point
```
