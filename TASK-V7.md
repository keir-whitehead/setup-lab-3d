# TASK-V7: Fix duplicates, remove Ultra, improve configurator UX

## 1. Remove M4 Ultra — it doesn't exist yet

**Files:** `src/types/index.ts`, `src/App.tsx`

- Remove `'M4 Ultra'` from `CHIP_CONFIGS`
- Remove `'M4 Ultra'` from `CHIP_PRICE_RANGES`
- Remove `'M4 Ultra'` from `CHIP_CPU_MAP`
- In `src/App.tsx`: Remove the `'Mac Pro'` template entirely from `MACHINE_TEMPLATES` and from the `MachineTemplateKey` type
- In `src/App.tsx`: Update `'Mac Studio'` template to use `'M4 Max'` chip with `128GB` RAM (already correct)
- The Mac Studio with M4 Max 128GB is the top-tier machine

## 2. Fix duplicate MacBook Air in GLB matching

**File:** `src/components/Scene.tsx`

The GLB has two MacBook Air positions:
- `MacBookAir_*` nodes at x=0.35 (right side of desk)
- `MacBookAir2_*` nodes at x=-0.9 (left side of desk)
- Plus `.001` duplicate nodes at same positions

The current `.includes('macbookair')` match catches ALL of them, showing two MacBook Airs.

**Fix:** Change `meshName` matching to be more precise:
- `MacBookAir` should match nodes starting with `MacBookAir_` but NOT `MacBookAir2_`
- `MacBookAir2` should be hidden by default (it's a second position in the GLB for if someone adds a second Air)

Update the matching logic in DeskModel to use a stricter check:
```typescript
// Instead of: name.includes(key)
// Use: name === key || name.startsWith(key + '_') || name.startsWith(key + '.')
```
But be careful: `MacBookAir` must NOT match `MacBookAir2`. So the check should be:
- Convert both to lowercase
- Check: `name === meshKey || name.startsWith(meshKey + '_') || name.startsWith(meshKey + '.')`
- This way `macbookair` matches `macbookair_base` but NOT `macbookair2_base`

Also hide the `.001` duplicate nodes unconditionally (they overlap the originals).

## 3. Fix initial machines — only show what the boss actually has

**File:** `src/data/machines.ts`

Update INITIAL_MACHINES to just 2 machines:
```typescript
[
  {
    id: 'mbp-m4-max',
    name: 'MacBook Pro',
    chip: 'M4 Max',
    ram: '64GB',
    storage: '1TB SSD',
    cpu: '16-core CPU',
    gpu: '40-core GPU',
    neural: '16-core Neural Engine',
    type: 'laptop',
    display: '16" Liquid Retina XDR',
    ports: '3x Thunderbolt 5, HDMI, SD, MagSafe',
    color: '#3b82f6',
    bandwidth: '546 GB/s',
    role: 'Mobile workstation / remote work',
    active: true,
    meshName: 'MacBookPro',
  },
  {
    id: 'mac-studio-m4-max',
    name: 'Mac Studio',
    chip: 'M4 Max',
    ram: '128GB',
    storage: '1TB SSD',
    cpu: '16-core CPU',
    gpu: '40-core GPU',
    neural: '16-core Neural Engine',
    type: 'desktop',
    display: 'No built-in display',
    ports: '3x Thunderbolt 5 (rear), 2x USB-C (front), HDMI, SD',
    color: '#8b5cf6',
    bandwidth: '546 GB/s',
    role: 'Primary desktop / always-on inference server',
    active: true,
    meshName: 'MacStudio',
  },
]
```

## 4. Show AI models while configuring — split panel UX

**File:** `src/components/InfoPanel.tsx`

The boss wants to see which models he can run WHILE changing the hardware config. Current UX forces switching between Hardware and AI Models tabs.

**Solution:** When a machine is expanded (selected) in the Hardware tab, show a compact "fits these models" summary inline on the card or below it. This is in addition to the full AI Models tab.

In `MachineCard.tsx`, when `isSelected` is true, add a section at the bottom showing models that fit in this machine's RAM:
- Filter aiModels where `vramGB <= parseRam(machine.ram) * 0.85`
- Show as small colored pills/badges: model name + VRAM
- Max 8 shown, with "+N more" if overflow
- This requires passing `aiModels` data to MachineCard

**Update props chain:**
1. `InfoPanel` already has `aiModels` — pass relevant filtered list to `MachineCard`
2. Add `fittingModels?: { name: string; vramGB: number }[]` prop to `MachineCard`
3. Show them in the expanded card view

## 5. Hide non-machine GLB objects that shouldn't be interactive

**File:** `src/components/Scene.tsx`

The Scene should hide `BackWall` and `Floor` GLB nodes (scene has its own ground). Already done in v6 but verify it works.

## Validation
```bash
npx tsc --noEmit && npx vite build
```

## DO NOT
- Add npm dependencies
- Create CSS files
- Modify the GLB file
- Change color scheme
