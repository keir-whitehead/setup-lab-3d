import type { AIModelDef, AIModelResult, CloudService } from '../types';

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
    latency: '~1-3s TTFT',
    model: 'claude-opus-4-6-20260115',
    context: '200K tokens',
  },
  {
    name: 'OpenAI Codex (GPT-5.3)',
    tier: 'OpenAI Plus / API',
    use: 'Agentic coding, multi-file refactors, test generation',
    latency: '~0.5-1.5s TTFT',
    model: 'codex-gpt-5.3-20260201',
    context: '200K tokens',
  },
];

export function getAIModels(
  totalRam: number,
  maxSingleMachine: number,
  machineCount: number,
  _studioCount: number
): AIModelResult[] {
  return AI_MODEL_DEFS.map((m) => {
    const fitsOnOne = m.vramGB <= maxSingleMachine * 0.85;
    const fitsDistributed = m.vramGB <= totalRam * 0.9;
    const lotsOfRoom = m.vramGB <= maxSingleMachine * 0.5;
    const headroomPct = Math.round((1 - m.vramGB / maxSingleMachine) * 100);
    const combinedHeadroomPct = Math.round((1 - m.vramGB / totalRam) * 100);
    let status: AIModelResult['status'];
    let speed: string;
    let runMode: string;
    let note: string;

    if (m.type === 'audio') {
      return {
        name: m.name, params: m.params, quant: m.quant,
        vram: `~${m.vramGB}GB`, speed: '~50x RT (MLX)',
        status: 'fast' as const, notes: m.desc,
        runMode: 'Any single machine', category: m.category, desc: m.desc,
        costPerMTokenInput: m.costPerMTokenInput,
        costPerMTokenOutput: m.costPerMTokenOutput,
        localCostPerHour: m.localCostPerHour,
      };
    }
    if (m.type === 'image') {
      return {
        name: m.name, params: m.params, quant: m.quant,
        vram: `~${m.vramGB}GB`, speed: `~${m.imgSpeed}s/img`,
        status: fitsOnOne ? 'fast' as const : 'no' as const,
        notes: m.desc,
        runMode: fitsOnOne ? 'Any single machine' : `Need ${m.vramGB}GB+`,
        category: m.category, desc: m.desc,
        localCostPerHour: m.localCostPerHour,
      };
    }

    const fmtLLM = (mlx: string, ollama: string) => `${mlx} (MLX) / ${ollama} (Ollama)`;

    if (lotsOfRoom) {
      status = 'fast';
      speed = fmtLLM(`~${m.singleMLX} t/s`, `~${m.singleOllama} t/s`);
      runMode = 'Any single machine';
      note = `${headroomPct}% RAM headroom. No need for distributed.`;
    } else if (fitsOnOne) {
      status = headroomPct > 20 ? 'fast' : 'runs';
      speed = fmtLLM(`~${m.singleMLX} t/s`, `~${m.singleOllama} t/s`);
      runMode = m.vramGB <= 64 * 0.85 ? 'Any single machine' : 'Studio (128GB)';
      note = `${headroomPct}% headroom on largest machine.`;
    } else if (fitsDistributed) {
      status = 'distributed';
      const exoTps = Math.round((m.exoSpeed ?? 8) * (1 + (machineCount - 2) * 0.25));
      speed = `~${exoTps} t/s (exo + RDMA)`;
      runMode = `exo across ${machineCount} machines`;
      note = `Requires distributed inference. ${combinedHeadroomPct}% headroom across ${totalRam}GB.`;
    } else {
      status = 'no';
      speed = '—';
      runMode = `Need ${m.vramGB}GB+`;
      note = m.desc;
    }

    // Calculate monthly savings estimate
    let monthlySavings: number | undefined;
    if (m.costPerMTokenInput && m.costPerMTokenOutput && status !== 'no') {
      // Assume ~100M tokens/month usage
      const cloudMonthlyCost = (m.costPerMTokenInput + m.costPerMTokenOutput) * 50;
      const localMonthlyCost = (m.localCostPerHour ?? 0.015) * 720; // 24/7
      monthlySavings = cloudMonthlyCost - localMonthlyCost;
    }

    return {
      name: m.name, params: m.params, quant: m.quant,
      vram: `~${m.vramGB}GB`, speed, status, notes: note, runMode,
      category: m.category, desc: m.desc,
      costPerMTokenInput: m.costPerMTokenInput,
      costPerMTokenOutput: m.costPerMTokenOutput,
      localCostPerHour: m.localCostPerHour,
      monthlySavings,
    };
  });
}
