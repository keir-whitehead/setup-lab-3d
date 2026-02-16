# Setup Lab 3D — Major Overhaul

Read AGENTS.md first. Then make ALL of the following changes across multiple files.

## 1. FIX CHIP SPECS (src/types/index.ts)

Update CHIP_CONFIGS to match Apple's actual specs. The M4 Max has TWO GPU variants with different bandwidths:
- 32-core GPU = 410 GB/s  
- 40-core GPU = 546 GB/s

Update gpuOptions to be arrays. Add a gpuBandwidthMap that maps GPU option to bandwidth (for M4 Max).

Update CHIP_CPU_MAP to include variant options where applicable.

## 2. UPDATE AI MODELS (src/data/aiModels.ts)

Add these NEW models to AI_MODEL_DEFS array:
- Qwen 3 32B: general, 32B, Q4_K_M, 18GB VRAM, MLX ~28 tok/s, Ollama ~22, cloud input $0.15 output $0.45
- Llama 4 Scout: general, 109B MoE (17B active), Q4_K_M, 65GB, MLX ~18 tok/s, 10M context, cloud input $0.05 output $0.25
- Gemma 3 27B: general, 27B, Q4_K_M, 16GB, MLX ~25 tok/s, cloud input $0.08 output $0.22
- Mistral Small 3.1: general, 24B, Q4_K_M, 14GB, MLX ~30 tok/s, cloud input $0.10 output $0.30
- DeepSeek R1 Distilled 32B: reasoning, 32B, Q4_K_M, 18GB, MLX ~25 tok/s, cloud input $0.14 output $0.56
- QwQ 32B: reasoning, 32B, Q4_K_M, 18GB, MLX ~25 tok/s, cloud input $0.15 output $0.60
- Qwen 2.5 Coder 32B: general, 32B, Q4_K_M, 18GB, MLX ~28 tok/s, cloud input $0.15 output $0.45
- DeepSeek Coder V2 16B: general, 16B, Q4_K_M, 9GB, MLX ~45 tok/s, cloud input $0.07 output $0.14
- Gemma 3 4B: small, 4B, Q4_K_M, 2.5GB, MLX ~100 tok/s, cloud input $0.02 output $0.05
- Llama 3.2 3B: small, 3B, Q4_K_M, 2GB, MLX ~120 tok/s, cloud input $0.01 output $0.03
- Qwen 3 8B: small, 8B, Q4_K_M, 5GB, MLX ~65 tok/s, cloud input $0.04 output $0.10
- Llama 4 Maverick: frontier, 400B MoE (17B active, 128 experts), Q4, 230GB, exo distributed only ~10 tok/s, cloud input $0.10 output $0.40
- SDXL Turbo: image, 3.5B, FP16, 4GB, ~3s/img

## 3. UPDATE MACHINE DEFAULTS (src/data/machines.ts)

- MacBook Pro: M4 Max, 64GB, 1TB, gpu: '40-core GPU', bandwidth: '546 GB/s'
- Mac Studio: M4 Max, 128GB, 1TB, gpu: '40-core GPU', bandwidth: '546 GB/s'  
- MacBook Air: M2, 16GB, 512GB (keep as-is)
- Mac Mini: M4 Pro, 48GB, 512GB, gpu: '20-core GPU', bandwidth: '273 GB/s'

## 4. MAKE CUSTOMIZER REACTIVE (src/components/MachineCard.tsx)

The config dropdown panel must actually work:
- When chip changes: derive cpu, gpu, ram, bandwidth from CHIP_CONFIGS and call onUpdateMachine with all fields
- When RAM changes: update bandwidth if applicable
- When GPU changes: update bandwidth (M4 Max 32-core=410GB/s, 40-core=546GB/s)

## 5. IMPROVE SCENE (src/components/Scene.tsx)

- Animated pulsing selection ring (useFrame to oscillate opacity)
- Add drei Html floating labels above each active machine showing name + RAM
- Add drei Sparkles for ambient atmosphere
- Better lighting: warm point light, cool fill light

## 6. ADD/REMOVE MACHINES (src/App.tsx + src/components/InfoPanel.tsx)

- "Add Machine" button adds a Mac Mini with default config
- Remove button on each MachineCard (min 1 machine required)
- Unique IDs via Date.now()

## 7. UI IMPROVEMENTS

### AIModelTable.tsx
- Add text search input to filter models by name
- Add category filter buttons (All, General, Reasoning, Small, Frontier, Image, Audio)

### CostsPanel.tsx  
- Add electricity rate input (default $0.30 AUD/kWh)
- Add hours/day slider (default 12)
- Recalculate all costs dynamically

### InfoPanel.tsx
- Add cluster summary at top showing total RAM, machine count, combined bandwidth

## VALIDATION
Run these commands to verify:
```
node_modules/.bin/tsc --noEmit
node_modules/.bin/vite build
```
Both must pass with zero errors.

## CONSTRAINTS
- No new npm dependencies
- All inline styles (no CSS files)
- strict TypeScript — zero errors
- DO NOT modify public/models/setup_lab.glb
