# Setup Lab v5 — Polish & Bug Fixes

Read AGENTS.md first. Then implement ALL changes below.

## BUG FIXES (Critical)

### 1. AI Model "save 0%" bug (src/components/AIModelTable.tsx)
The cost comparison line shows "save 0%" for most models. The issue: local cost is calculated as `(localCostPerHour ?? 0.015) * 720` which is $10.80/mo for ALL models regardless. Cloud cost for small models (e.g. Llama 3.2 3B at $0.01+$0.03 input/output per M tokens * 50) = $2/mo — which is LESS than local, so savings are negative but showing 0%.

Fix: Only show "save X%" when cloud cost > local cost. When cloud is cheaper, show "Cloud is cheaper for this model" in a subtle muted style. The monthly savings calc should use realistic per-model token volumes not a flat 50M multiplier:
- Small models (<10B): assume 200M tokens/month (high usage, they're fast)
- General models (10-70B): assume 100M tokens/month
- Frontier models (>100B): assume 30M tokens/month
- Image models: assume 5000 images/month
- Audio models: assume 200 hours/month

### 2. Local cost should vary by model size
Bigger models use more power. Estimate:
- <10B: 60W → $0.018/kWh * hours
- 10-40B: 80W → $0.024/kWh * hours  
- 40-100B: 100W → $0.030/kWh * hours
- 100B+: 120W → $0.036/kWh * hours
Use 12 hours/day, $0.30/kWh default. Store in the model def or calculate inline.

## VISUAL IMPROVEMENTS

### 3. Scene.tsx — Better atmosphere
- Replace the grey background walls. The scene should have NO visible walls/room.
- Background: pure gradient, dark navy to slightly lighter at horizon: `linear-gradient(180deg, #050510 0%, #0d0d2b 40%, #151530 100%)`
- Add a subtle ground plane: a large disc (radius 10) at y=0 with a dark material (color #0a0a18, roughness 1, metalness 0) — this gives soft reflections without visible edges
- Remove Environment preset="night" — use pure manual lighting for full control:
  - Key light: directional, position [3, 6, 2], intensity 1.2, color #fff8f0 (warm), castShadow, shadow-mapSize 2048
  - Fill light: directional, position [-4, 4, -3], intensity 0.3, color #8090ff (cool blue)
  - Rim light: point, position [-1, 3, -4], intensity 0.4, color #c0a0ff (purple tint)
  - Underglow: point, position [0, 0.05, 0], intensity 0.15, color #818cf8, distance 3
  - Ambient: intensity 0.08 (very low — let directional lights do the work)
- ContactShadows: opacity 0.6, blur 2.5, far 5, resolution 512
- Add tone mapping: Canvas props: `gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}`
- Camera: position [2.8, 1.8, 2.8], fov 38 (slightly lower angle, more dramatic)
- OrbitControls target: [0, 0.6, 0]

### 4. Scene.tsx — Selection indicator
Replace the pulsing ring with a soft glow disc:
- A flat circular mesh (circleGeometry radius 0.5) at the base of the selected machine
- MeshBasicMaterial with color=machine.color, opacity pulsing between 0.08 and 0.2, transparent
- Scale the disc to 1.5x the machine's bounding box width
- This gives a subtle "spotlight" effect under the selected machine

### 5. Scene.tsx — Floating labels  
- Only show labels when a machine IS selected (for that machine only) or on hover
- Label style: smaller (fontSize 9), all uppercase, letter-spacing 0.1em
- Show: "MACBOOK PRO · 64GB" format
- Background: rgba(0,0,0,0.7) with border-radius 4, padding 3px 8px
- No colored border on labels — keep them minimal

### 6. InfoPanel.tsx — Compact header
The "256GB / Unified Memory Pool" header takes too much space. Make it:
- Single line: "256GB" (24px bold, #f8fafc) + "unified memory" (12px, muted) on same line
- Stats row below: "4 machines · 1465 GB/s · exo ready" in small mono text
- Total header height should be ~60px max, not 120px

### 7. MachineCard.tsx — Better expand animation
- When selected, the card should have a left border accent (3px solid machine.color) instead of the full border glow
- Unselected: clean, flat, one-line row
- The "Config" button text is confusing — remove it. Just expand on click, collapse on click again.

### 8. AIModelTable.tsx — Better model cards
- The left colored border is good. Make it 3px (not 2px).
- Speed text: 24px bold, not the current massive size. Keep it prominent but not overwhelming.
- For models that can't run: grey them out more aggressively. Use opacity 0.35 on the entire card. Show "Requires {needed}GB" in red where {needed} is the model's VRAM requirement.
- "Runs on:" text is too long when all machines are listed. If it runs on ALL machines, just say "Runs on: All machines". If 2+, say "Runs on: {count} machines". If 1, name it.

### 9. CostsPanel.tsx — Better ROI bars  
- The ROI progress bars look good. Add percentage labels on the bars.
- Color the bars: red when negative, transition through yellow to green as they go positive
- The settings section (electricity rate + hours) should default collapsed with a small "⚙ Settings" toggle

### 10. Global — Scrollbar styling
Add a global style for custom scrollbar in the panel:
- In InfoPanel's scrollable div, add WebKit scrollbar styles:
  - scrollbarWidth: 'thin'
  - scrollbarColor: 'rgba(255,255,255,0.1) transparent'

## VALIDATION
After all changes, run:
```
node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build
```
Both must succeed with zero errors.
