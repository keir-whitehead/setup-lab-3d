import type { AIModelDef, AIModelResult, CloudService, Machine } from '../types';

export const AI_MODEL_DEFS: AIModelDef[] = [
  {
    name: 'Qwen 2.5 72B', params: '72B', quant: 'Q4_K_M', vramGB: 42,
    category: 'general', type: 'llm',
    singleMLX: 12, singleOllama: 9, exoSpeed: 8,
    exoNote: 'pipeline overhead > single-machine speed',
    unit: 'tok/s',
    desc: 'Best all-round: coding, multilingual, reasoning. Fits on Studio with 86GB headroom.',
    costPerMTokenInput: 0.30, costPerMTokenOutput: 0.90, localCostPerHour: 0.015,
  },
  {
    name: 'DeepSeek R1 70B', params: '70B', quant: 'Q4_K_M', vramGB: 40,
    category: 'reasoning', type: 'llm',
    singleMLX: 12, singleOllama: 10, exoSpeed: 8,
    exoNote: 'not needed — fits on single Studio',
    unit: 'tok/s',
    desc: 'Strong reasoning/chain-of-thought. Fits on Studio with good headroom.',
    costPerMTokenInput: 0.55, costPerMTokenOutput: 2.19, localCostPerHour: 0.015,
  },
  {
    name: 'DeepSeek V3', params: '671B MoE', quant: 'Q2-Q3', vramGB: 128,
    category: 'frontier', type: 'llm',
    singleMLX: 8, singleOllama: 5, exoSpeed: 12,
    exoNote: 'MoE only loads ~37B active params — exo helps with memory split',
    unit: 'tok/s',
    desc: 'Frontier MoE model. Only 37B active params = faster than dense 70B despite size.',
    costPerMTokenInput: 0.27, costPerMTokenOutput: 1.10, localCostPerHour: 0.015,
  },
  {
    name: 'Llama 3.3 70B', params: '70B', quant: 'Q4_K_M', vramGB: 40,
    category: 'general', type: 'llm',
    singleMLX: 12, singleOllama: 9, exoSpeed: 8,
    exoNote: 'not needed — fits on single Studio',
    unit: 'tok/s',
    desc: 'Meta open model. Strong coding + instruction following.',
    costPerMTokenInput: 0.20, costPerMTokenOutput: 0.20, localCostPerHour: 0.015,
  },
  {
    name: 'Mistral Large', params: '123B', quant: 'Q4_K_M', vramGB: 70,
    category: 'general', type: 'llm',
    singleMLX: 7, singleOllama: 5, exoSpeed: null,
    exoNote: 'fits on 128GB Studio',
    unit: 'tok/s',
    desc: 'Mistral flagship. Needs 128GB machine.',
    costPerMTokenInput: 2.00, costPerMTokenOutput: 6.00, localCostPerHour: 0.015,
  },
  {
    name: 'Phi-4', params: '14B', quant: 'Q4_K_M', vramGB: 9,
    category: 'small', type: 'llm',
    singleMLX: 45, singleOllama: 35, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Microsoft small model. Fast on any machine.',
    costPerMTokenInput: 0.07, costPerMTokenOutput: 0.14, localCostPerHour: 0.015,
  },
  {
    name: 'Gemma 2 27B', params: '27B', quant: 'Q4_K_M', vramGB: 16,
    category: 'general', type: 'llm',
    singleMLX: 25, singleOllama: 18, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Google mid-size model. Good balance.',
    costPerMTokenInput: 0.08, costPerMTokenOutput: 0.22, localCostPerHour: 0.015,
  },
  {
    name: 'Qwen 3 32B', params: '32B', quant: 'Q4_K_M', vramGB: 18,
    category: 'general', type: 'llm',
    singleMLX: 28, singleOllama: 22, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Qwen 3 mid-large model for coding and general assistant tasks.',
    costPerMTokenInput: 0.15, costPerMTokenOutput: 0.45, localCostPerHour: 0.015,
  },
  {
    name: 'Llama 4 Scout', params: '109B MoE (17B active)', quant: 'Q4_K_M', vramGB: 65,
    category: 'general', type: 'llm',
    singleMLX: 18, singleOllama: null, exoSpeed: 14,
    exoNote: '10M context model with MoE active parameter footprint',
    unit: 'tok/s',
    desc: 'Large-context MoE model with 10M context support and strong general performance.',
    costPerMTokenInput: 0.05, costPerMTokenOutput: 0.25, localCostPerHour: 0.015,
  },
  {
    name: 'Gemma 3 27B', params: '27B', quant: 'Q4_K_M', vramGB: 16,
    category: 'general', type: 'llm',
    singleMLX: 25, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Gemma 3 27B balances quality and speed for daily local assistant use.',
    costPerMTokenInput: 0.08, costPerMTokenOutput: 0.22, localCostPerHour: 0.015,
  },
  {
    name: 'Mistral Small 3.1', params: '24B', quant: 'Q4_K_M', vramGB: 14,
    category: 'general', type: 'llm',
    singleMLX: 30, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Fast 24B class model suited to local coding and chat workloads.',
    costPerMTokenInput: 0.10, costPerMTokenOutput: 0.30, localCostPerHour: 0.015,
  },
  {
    name: 'DeepSeek R1 Distilled 32B', params: '32B', quant: 'Q4_K_M', vramGB: 18,
    category: 'reasoning', type: 'llm',
    singleMLX: 25, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Reasoning-focused distilled model with lower VRAM than frontier reasoning models.',
    costPerMTokenInput: 0.14, costPerMTokenOutput: 0.56, localCostPerHour: 0.015,
  },
  {
    name: 'QwQ 32B', params: '32B', quant: 'Q4_K_M', vramGB: 18,
    category: 'reasoning', type: 'llm',
    singleMLX: 25, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'QwQ reasoning model tuned for deliberate multi-step inference.',
    costPerMTokenInput: 0.15, costPerMTokenOutput: 0.60, localCostPerHour: 0.015,
  },
  {
    name: 'Qwen 2.5 Coder 32B', params: '32B', quant: 'Q4_K_M', vramGB: 18,
    category: 'general', type: 'llm',
    singleMLX: 28, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Coder-specialized Qwen model for repositories, refactors, and code chat.',
    costPerMTokenInput: 0.15, costPerMTokenOutput: 0.45, localCostPerHour: 0.015,
  },
  {
    name: 'DeepSeek Coder V2 16B', params: '16B', quant: 'Q4_K_M', vramGB: 9,
    category: 'general', type: 'llm',
    singleMLX: 45, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Efficient coder model with high token throughput on Apple Silicon.',
    costPerMTokenInput: 0.07, costPerMTokenOutput: 0.14, localCostPerHour: 0.015,
  },
  {
    name: 'Gemma 3 4B', params: '4B', quant: 'Q4_K_M', vramGB: 2.5,
    category: 'small', type: 'llm',
    singleMLX: 100, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Small high-speed assistant model for lightweight local tasks.',
    costPerMTokenInput: 0.02, costPerMTokenOutput: 0.05, localCostPerHour: 0.015,
  },
  {
    name: 'Llama 3.2 3B', params: '3B', quant: 'Q4_K_M', vramGB: 2,
    category: 'small', type: 'llm',
    singleMLX: 120, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Very small model for local automation and rapid low-cost inference.',
    costPerMTokenInput: 0.01, costPerMTokenOutput: 0.03, localCostPerHour: 0.015,
  },
  {
    name: 'Qwen 3 8B', params: '8B', quant: 'Q4_K_M', vramGB: 5,
    category: 'small', type: 'llm',
    singleMLX: 65, singleOllama: null, exoSpeed: null,
    exoNote: 'not needed',
    unit: 'tok/s',
    desc: 'Compact Qwen variant with strong quality per GB for laptops and minis.',
    costPerMTokenInput: 0.04, costPerMTokenOutput: 0.10, localCostPerHour: 0.015,
  },
  {
    name: 'Llama 4 Maverick', params: '400B MoE (17B active, 128 experts)', quant: 'Q4', vramGB: 230,
    category: 'frontier', type: 'llm',
    singleMLX: null, singleOllama: null, exoSpeed: 10,
    exoNote: 'distributed only',
    unit: 'tok/s',
    desc: 'Frontier MoE model designed for distributed exo-style inference only.',
    costPerMTokenInput: 0.10, costPerMTokenOutput: 0.40, localCostPerHour: 0.015,
  },
  {
    name: 'SDXL Turbo', params: '3.5B', quant: 'FP16', vramGB: 4,
    category: 'image', type: 'image',
    singleMLX: null, singleOllama: null, exoSpeed: null,
    exoNote: 'not applicable',
    unit: 's/img', imgSpeed: 3,
    desc: 'Fast distilled SDXL image generation around three seconds per image.',
    localCostPerHour: 0.015,
  },
  {
    name: 'Whisper Large V3 Turbo', params: '809M', quant: 'FP16', vramGB: 2,
    category: 'audio', type: 'audio',
    singleMLX: null, singleOllama: null, exoSpeed: null,
    exoNote: 'not applicable',
    unit: 'x RT', rtFactor: 0.02,
    desc: 'Near-instant transcription. M4 Max transcribes 1hr audio in ~1.5min via MLX.',
    costPerMTokenInput: undefined, costPerMTokenOutput: undefined, localCostPerHour: 0.015,
  },
  {
    name: 'SD 3.5 Turbo', params: '2.6B', quant: 'FP16', vramGB: 6,
    category: 'image', type: 'image',
    singleMLX: null, singleOllama: null, exoSpeed: null,
    exoNote: 'not applicable',
    unit: 's/img', imgSpeed: 2,
    desc: 'Photorealistic 512x512 images in ~2s on M4. 4-step distilled model.',
    localCostPerHour: 0.015,
  },
  {
    name: 'FLUX.1 Dev', params: '12B', quant: 'FP16', vramGB: 24,
    category: 'image', type: 'image',
    singleMLX: null, singleOllama: null, exoSpeed: null,
    exoNote: 'not applicable',
    unit: 's/img', imgSpeed: 8,
    desc: 'Best open image gen. Needs 24GB+ for good speed.',
    localCostPerHour: 0.015,
  },
];

export const CLOUD_SERVICES: CloudService[] = [
  {
    name: 'Claude Opus 4.6',
    tier: 'Anthropic Pro / API',
    use: 'Frontier reasoning, complex analysis, long-form writing',
    model: 'claude-opus-4-6-20260115',
    context: '200K tokens',
    pricing: '$15/M input, $75/M output',
  },
  {
    name: 'OpenAI Codex (GPT-5.3)',
    tier: 'OpenAI Plus / API',
    use: 'Agentic coding, multi-file refactors, test generation',
    model: 'codex-gpt-5.3-20260201',
    context: '200K tokens',
    pricing: '$6/M input, $18/M output',
  },
  {
    name: 'GPT-4o',
    tier: 'OpenAI API',
    use: 'General fast inference for chat, extraction, and assistant UX',
    model: 'gpt-4o',
    context: '128K tokens',
    pricing: '$5/M input, $15/M output',
  },
  {
    name: 'Gemini 2.5 Pro',
    tier: 'Google AI Studio / Vertex AI',
    use: 'Long-context analysis and multimodal reasoning workloads',
    model: 'gemini-2.5-pro',
    context: '1M tokens',
    pricing: 'Varies by provider tier and token band',
  },
  {
    name: 'Perplexity API',
    tier: 'Perplexity API',
    use: 'Search-augmented answers with fresh web context',
    model: 'sonar-pro',
    context: '128K tokens',
    pricing: 'Per request + token pricing',
  },
];

const parseRam = (ram: string): number => {
  const value = Number.parseInt(ram, 10);
  return Number.isFinite(value) ? value : 0;
};

const parseSpeedMetric = (speed: string): number => {
  const match = speed.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : 0;
};

const listMachines = (machines: Machine[]): string =>
  machines.map((machine) => `${machine.name} (${machine.ram})`).join(', ');

export function getAIModels(activeMachines: Machine[]): AIModelResult[] {
  const totalRam = activeMachines.reduce((sum, machine) => sum + parseRam(machine.ram), 0);
  const maxSingleMachine = Math.max(...activeMachines.map((machine) => parseRam(machine.ram)), 0);
  const machineCount = activeMachines.length;

  return AI_MODEL_DEFS.map((model) => {
    const safeMaxSingle = Math.max(maxSingleMachine, 1);
    const safeTotalRam = Math.max(totalRam, 1);
    const fittingMachines = activeMachines.filter((machine) => model.vramGB <= parseRam(machine.ram) * 0.85);
    const fitsOnOne = fittingMachines.length > 0;
    const fitsDistributed = model.vramGB <= safeTotalRam * 0.9 && machineCount >= 2;
    const lotsOfRoom = model.vramGB <= safeMaxSingle * 0.5;

    let status: AIModelResult['status'];
    let speed: string;
    let runMode: string;
    let note: string;
    let runsOn: string;

    if (model.type === 'audio') {
      status = fitsOnOne ? 'fast' : 'no';
      speed = '~50x RT';
      runMode = fitsOnOne ? 'Any single machine' : `Need ${model.vramGB}GB+`;
      note = model.desc;
      runsOn = fitsOnOne ? listMachines(fittingMachines) : `Need ${model.vramGB}GB+`;
    } else if (model.type === 'image') {
      status = fitsOnOne ? 'fast' : 'no';
      speed = `~${model.imgSpeed ?? 0} s/img`;
      runMode = fitsOnOne ? 'Any single machine' : `Need ${model.vramGB}GB+`;
      note = model.desc;
      runsOn = fitsOnOne ? listMachines(fittingMachines) : `Need ${model.vramGB}GB+`;
    } else if (lotsOfRoom) {
      status = 'fast';
      speed = `${model.singleMLX ?? model.singleOllama ?? 0} tok/s`;
      runMode = 'Single machine';
      note = 'Plenty of memory headroom for steady local throughput.';
      runsOn = listMachines(fittingMachines);
    } else if (fitsOnOne) {
      status = 'runs';
      speed = `${model.singleMLX ?? model.singleOllama ?? 0} tok/s`;
      runMode = 'Single machine';
      note = 'Runs locally with tighter memory overhead.';
      runsOn = listMachines(fittingMachines);
    } else if (fitsDistributed) {
      status = 'distributed';
      const baseExoSpeed = model.exoSpeed ?? 8;
      const distributedOnly = model.exoNote.toLowerCase().includes('distributed only');
      const scale = distributedOnly ? 1 : 1 + Math.max(machineCount - 2, 0) * 0.25;
      speed = `${Math.round(baseExoSpeed * scale)} tok/s`;
      runMode = `exo cluster across ${machineCount} machines`;
      note = `Distributed memory split required across ${totalRam}GB unified RAM.`;
      runsOn = 'exo cluster';
    } else {
      status = 'no';
      speed = '0 tok/s';
      runMode = `Need ${model.vramGB}GB+`;
      note = model.desc;
      runsOn = `Need ${model.vramGB}GB+`;
    }

    let monthlySavings: number | undefined;
    if (model.costPerMTokenInput !== undefined && model.costPerMTokenOutput !== undefined && status !== 'no') {
      const cloudMonthlyCost = (model.costPerMTokenInput + model.costPerMTokenOutput) * 50;
      const localMonthlyCost = (model.localCostPerHour ?? 0.015) * 720;
      monthlySavings = cloudMonthlyCost - localMonthlyCost;
    }

    const normalizedSpeed = `${Math.max(0, Math.round(parseSpeedMetric(speed)))} ${model.unit}`;

    return {
      name: model.name,
      params: model.params,
      quant: model.quant,
      vram: `~${model.vramGB}GB`,
      speed: normalizedSpeed,
      status,
      notes: note,
      runMode,
      runsOn,
      category: model.category,
      desc: model.desc,
      costPerMTokenInput: model.costPerMTokenInput,
      costPerMTokenOutput: model.costPerMTokenOutput,
      localCostPerHour: model.localCostPerHour,
      monthlySavings,
    };
  });
}
