# TASK-V6: Configurator UX Overhaul

## Context
The GLB model (`public/models/setup_lab.glb`) has been updated with a realistic desk setup including cables, desk lamp, monitors, network switch, keyboard, mouse. The mesh names changed — current code can't match them.

## Critical Bug: Mesh Name Matching
The `Scene.tsx` DeskModel uses `child.name.toLowerCase().includes(meshKey)` to match machines to GLB nodes.

**Current meshName values in code:** `MacBook_Air`, `MacBook_Pro`, `Mac_Mini`, `Mac_Studio`
**Actual GLB node names:** `MacBookAir_*`, `MacBookPro_*`, `MacMini_*`, `MacStudio_*`, `MacBookAir2_*`

The underscores in code meshNames don't match GLB names. Fix: update meshName values in `INITIAL_MACHINES` (machines.ts), `MACHINE_TEMPLATES` (App.tsx), and anywhere else to match the GLB.

**Mapping:**
- MacBook Air → meshName `MacBookAir` (matches nodes like `MacBookAir_Base`, `MacBookAir_Lid`)
- MacBook Pro → meshName `MacBookPro` (matches `MacBookPro_Base`, etc.)
- Mac Mini → meshName `MacMini` (matches `MacMini_Body`, etc.)
- Mac Studio → meshName `MacStudio` (matches `MacStudio_Body`, etc.)
- Mac Pro → meshName `MacPro` (no mesh in GLB — Mac Pro doesn't have a physical model yet, that's fine)

**GLB also has these non-machine nodes (always visible):**
- `Desk_Top`, `DeskLeg*` — desk
- `Monitor34_*`, `Monitor27_*`, `Espresso_*` — monitors
- `Cable_*` — cables
- `DeskLamp_*` — lamp
- `NetworkSwitch`, `SwitchLED_*` — network switch
- `Keyboard`, `Mouse` — peripherals
- `Floor`, `BackWall` — environment (hide BackWall)
- `KeyLight`, `FillLight`, `MonitorGlow*`, `AccentUnderDesk` — lights (these are Blender lights, they export as empty nodes in GLB and don't do anything in three.js)

## Tasks

### 1. Fix mesh name matching (CRITICAL)
- Update `meshName` in `src/data/machines.ts` INITIAL_MACHINES
- Update `meshName` in `src/App.tsx` MACHINE_TEMPLATES
- Ensure the `.toLowerCase().includes()` pattern works with new names

### 2. Fix lighting
Current Scene.tsx lighting is flat/glitchy. Replace with:
- Warm key light from upper-right: `directionalLight position={[3, 5, 2]} intensity={1.0} color="#fff4e8"` with shadows
- Cool fill from left: `directionalLight position={[-3, 3, -1]} intensity={0.25} color="#c0d0ff"`
- Soft ambient: `ambientLight intensity={0.12}`
- Remove the ground-level point lights that cause glitchy underglow
- Add subtle `Environment` from drei with `preset="night"` and low intensity (0.15) for reflections
- Keep the ground plane disc but make it larger and darker

### 3. Improve the configurator UX
The boss says "it's not much of a configurator yet." The config editing exists but is buried. Make it front-and-center:

**a) Default to first machine selected/expanded on load** — don't start with everything collapsed

**b) Make machine cards show a mini config summary even when collapsed:**
Current collapsed card shows: name, chip, ram, bandwidth, toggle
Good enough — but add the GPU core count too

**c) Make "Add Machine" more prominent:**
- Instead of a dashed box with hidden picker, show a row of small icon buttons (one per machine type) always visible below the machine list
- Each button: machine name + a small "+" icon
- Clicking adds immediately (no two-step picker)

**d) Make "Remove" easier:**
- Add a small "×" button on the collapsed card (right side, before toggle)
- Only show if there's more than 1 machine

**e) Auto-select newly added machines** (already done in App.tsx)

### 4. Show "What Can I Run" more prominently
When a machine is selected and expanded, show a quick summary below the specs:
- "Can run: Llama 3.3 70B, Qwen 72B, ..." (list the biggest models that fit in its RAM)
- Use the aiModels data — filter for models where `vramGB <= parseRam(machine.ram)`
- Show as colored tags/chips below the spec grid

### 5. Scene improvements
- Hide `BackWall` and `Floor` nodes from GLB (the scene has its own ground plane)
- Don't hide machines that don't have a GLB mesh (Mac Pro) — just skip them silently
- Machine visibility toggling should work: when `active: false`, hide all nodes matching that meshName

### 6. Don't break existing functionality
- All chip/ram/gpu/storage dropdowns must still work
- AI Models tab, Costs tab, Cloud tab must still work
- TypeScript strict mode must pass

## Validation
```bash
npx tsc --noEmit && npx vite build
```

## DO NOT
- Add new npm dependencies
- Create CSS files (all inline styles)
- Modify the GLB file
- Change the color scheme (dark theme, #0a0a1a base, #818cf8 accent)
