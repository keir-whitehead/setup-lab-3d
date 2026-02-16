# Setup Lab v4 — Visual & UX Overhaul

This is a COMPLETE visual redesign and UX overhaul. Read every file before editing.

## DESIGN VISION
Think Apple.com product configurator meets a premium dark dashboard. Clean, spacious, beautiful.
The left side is the 3D scene. The right side is the configurator panel.

## FILE-BY-FILE CHANGES

### src/App.tsx
- Change layout: left 60% (3D scene), right 40% (configurator panel)
- Move the RAM overlay to show: total RAM, machine count, combined bandwidth, and "exo cluster: {status}" where status is "ready" if 2+ machines or "single node"
- Style the overlay as a frosted glass pill with subtle glow

### src/components/Scene.tsx
COMPLETE rewrite of lighting and atmosphere:
- Remove gridHelper (ugly grid lines)
- Remove Sparkles (cheap looking)
- Use Environment preset="night" instead of "city" for darker, moodier look
- Lighting setup:
  - ambientLight intensity 0.15 (very subtle)
  - One key directional light: position [5, 8, 3], intensity 0.6, warm white
  - One fill light: position [-4, 3, -2], intensity 0.2, cool blue #b0c4ff
  - One rim/back light: position [0, 4, -5], intensity 0.3
  - Add a subtle colored point light under the desk: position [0, 0.1, 0], intensity 0.1, color #818cf8 (gives underglow)
- ContactShadows: increase blur to 3, opacity 0.5
- Camera: position [2.5, 2, 2.5], fov 40 (tighter, more cinematic)
- OrbitControls: set target to [0, 0.5, 0] to center on desk
- Html labels: make smaller, use opacity 0.7, show only on hover or when selected
- Selection ring: make it a subtle glow circle, not a visible ring. Use a disc mesh with a radial gradient texture or just a larger, more transparent disc with color matching machine.color
- ADD: Subtle fog: <fog attach="fog" args={['#0a0a1a', 5, 20]} />

### src/components/InfoPanel.tsx  
COMPLETE visual overhaul:
- Background: solid #0d0d1f (not transparent)
- Remove the ugly cluster summary grid at top. Replace with a HERO section:
  - Large number: "{totalRam}GB" in 36px bold
  - Subtitle: "Unified Memory Pool"
  - Below: 3 small stats in a row: "{machines} machines" · "{bandwidth} GB/s" · "exo {ready/single}"
  - Use a subtle gradient border on the bottom

- Tab bar: Make it look like Apple segment control. Pill-shaped, background #1a1a2e, active tab gets white text and subtle background
- Content area: more padding (24px), more spacing between elements

### src/components/MachineCard.tsx
MAJOR redesign — this needs to feel like a CONFIGURATOR:
- Default state (not selected): Show a compact row with: color dot, name, chip, ram, bandwidth, toggle switch. Clean single line.
- Selected state: Expand to show the FULL configurator with:
  - Top: Machine name as heading, form factor subtitle (e.g. "16-inch Laptop" or "Compact Desktop")
  - Dropdowns in a clean 2-column grid:
    - Chip (with a visual indicator showing the tier: base/pro/max/ultra)
    - RAM 
    - GPU
    - Storage
  - Below dropdowns: a "Specs" section showing derived values:
    - CPU cores, GPU cores, Neural Engine cores, Bandwidth
    - Price range
    - A small badge showing what this machine can run: "Up to 70B models" or "Up to 32B models" based on RAM
  - Remove button as a subtle text link, not a prominent button
  - The toggle switch should be in the top-right of the expanded card

- Add "Add Machine" as a dashed-border card at the bottom of the machine list that opens a picker:
  - Options: MacBook Air, MacBook Pro, Mac Mini, Mac Studio, Mac Pro
  - Each with a default chip/ram config
  - Clicking one adds it immediately

### src/components/AIModelTable.tsx  
REDESIGN for clarity:
- Remove the summary bar at top (cluttered)
- Instead, show a header: "What Can You Run?" with subtitle showing "{count} models compatible with your {totalRam}GB setup"
- Category filters: horizontal scroll pills, not wrapped (use overflow-x auto)
- Each model card:
  - Left colored border (2px) based on status: green=fast, blue=runs, purple=distributed, red=no
  - Name in bold, params + quant in subtle mono text on same line
  - Speed as the prominent metric: "28 tok/s" in large text
  - "Runs on: Mac Studio (128GB)" or "Requires: exo cluster" or "Cannot run: need 256GB+"
  - Collapse cloud cost comparison into a single line: "Local: $11/mo vs Cloud: $60/mo — save 82%"
  - For models that CAN'T run: show in a muted/disabled style with "Upgrade to run this" hint showing what RAM is needed
- Search: make it full-width, rounded, with a search icon placeholder
- Remove the collapsible category sections — just show a flat filtered list sorted by: runnable first (by speed desc), then non-runnable

### src/components/CostsPanel.tsx
- Clean up: Less cramped, more whitespace
- Move electricity inputs into a collapsible "Settings" section at the bottom
- Top: Big hero number showing monthly savings with a green up arrow
- Then: A simple 3-row comparison:
  - Row 1: "Running locally" → $X/mo (green)
  - Row 2: "Cloud APIs" → $X/mo (red)  
  - Row 3: "You save" → $X/mo (bold green)
- Then: Hardware investment card with total and break-even
- Then: ROI timeline (cleaner, use a simple progress-bar style for each month)

### src/components/CloudPanel.tsx
- Add more cloud services:
  - GPT-4o (general fast inference)
  - Gemini 2.5 Pro (long context, multimodal)  
  - Perplexity API (search-augmented)
- For each, show: name, tier, use case, model, context window, pricing
- Add a note at bottom: "Cloud complements local — use cloud for frontier capability, local for privacy + cost savings"

### src/data/aiModels.ts
- In getAIModels function, add a `runsOn` field to AIModelResult showing which specific machine(s) the model fits on (based on RAM check against each active machine)
- Update AIModelResult interface in types to include: runsOn: string

### src/types/index.ts
- Add `runsOn: string` to AIModelResult interface

## CRITICAL CONSTRAINTS
1. ZERO type errors — run `node_modules/.bin/tsc --noEmit` and fix ALL errors
2. Clean build — run `node_modules/.bin/vite build` 
3. No new dependencies
4. All inline styles
5. DO NOT touch public/models/setup_lab.glb
6. DO NOT touch src/data/monitors.ts
7. Every dropdown change MUST call onUpdateMachine to update state

## VALIDATION
After all changes, run:
```
node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build
```
Both must succeed. If tsc fails, FIX the errors. Do not skip this step.

When done, run: openclaw system event --text "Setup Lab v4 visual overhaul complete — ready for deploy" --mode now
