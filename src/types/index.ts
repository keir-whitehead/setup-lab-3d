export interface Machine {
  id: string;
  name: string;
  chip: string;
  ram: string;
  storage: string;
  cpu: string;
  gpu: string;
  neural: string;
  type: 'laptop' | 'desktop';
  display: string;
  ports: string;
  color: string;
  bandwidth: string;
  role: string;
  active: boolean;
  meshName: string;
}

export interface Monitor {
  id: string;
  name: string;
  resolution: string;
  refresh: string;
  panel: string;
  size: string;
  colorGamut: string;
  connection: string;
  features?: string;
  meshName: string;
}

export interface AIModelDef {
  name: string;
  params: string;
  quant: string;
  vramGB: number;
  category: string;
  type: 'llm' | 'audio' | 'image';
  singleMLX: number | null;
  singleOllama: number | null;
  exoSpeed: number | null;
  exoNote: string;
  unit: string;
  rtFactor?: number;
  imgSpeed?: number;
  desc: string;
  costPerMTokenInput?: number;
  costPerMTokenOutput?: number;
  costPerImage?: number;
  costPerAudioHour?: number;
  localCostPerHour?: number;
}

export interface AIModelResult {
  name: string;
  params: string;
  quant: string;
  vram: string;
  vramGB: number;
  type: 'llm' | 'audio' | 'image';
  speed: string;
  status: 'fast' | 'runs' | 'distributed' | 'tight' | 'no';
  notes: string;
  runMode: string;
  runsOn: string;
  runnableMachineCount: number;
  runsOnAllMachines: boolean;
  category: string;
  desc: string;
  costPerMTokenInput?: number;
  costPerMTokenOutput?: number;
  costPerImage?: number;
  costPerAudioHour?: number;
  localCostPerHour?: number;
  monthlySavings?: number;
}

export interface CloudService {
  name: string;
  tier: string;
  use: string;
  model: string;
  context: string;
  pricing: string;
}

export type InfoTab = 'specs' | 'ai' | 'costs' | 'cloud';

export interface ChipConfig {
  ramOptions: string[];
  gpuOptions: string[];
  bandwidthMap: Record<string, string>;
  gpuBandwidthMap?: Record<string, string>;
}

export const CHIP_CONFIGS: Record<string, ChipConfig> = {
  'M4': {
    ramOptions: ['16GB', '24GB', '32GB'],
    gpuOptions: ['10-core GPU'],
    bandwidthMap: { '16GB': '120 GB/s', '24GB': '120 GB/s', '32GB': '120 GB/s' },
  },
  'M4 Pro': {
    ramOptions: ['24GB', '48GB'],
    gpuOptions: ['20-core GPU'],
    bandwidthMap: { '24GB': '273 GB/s', '48GB': '273 GB/s' },
  },
  'M4 Max': {
    ramOptions: ['36GB', '48GB', '64GB', '128GB'],
    gpuOptions: ['32-core GPU', '40-core GPU'],
    bandwidthMap: { '36GB': '410 GB/s', '48GB': '410 GB/s', '64GB': '546 GB/s', '128GB': '546 GB/s' },
    gpuBandwidthMap: { '32-core GPU': '410 GB/s', '40-core GPU': '546 GB/s' },
  },
  'M2': {
    ramOptions: ['8GB', '16GB', '24GB'],
    gpuOptions: ['10-core GPU'],
    bandwidthMap: { '8GB': '100 GB/s', '16GB': '100 GB/s', '24GB': '100 GB/s' },
  },
};

export const STORAGE_OPTIONS = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD', '8TB SSD'];

export const CHIP_PRICE_RANGES: Record<string, [number, number]> = {
  'M4': [599, 799],
  'M4 Pro': [1599, 2399],
  'M4 Max': [2499, 4999],
  'M2': [499, 699],
};

export type ChipCpuMapValue = string | Record<string, string>;

export const CHIP_CPU_MAP: Record<string, ChipCpuMapValue> = {
  'M4': {
    '10-core GPU': '10-core CPU',
  },
  'M4 Pro': {
    '20-core GPU': '14-core CPU',
  },
  'M4 Max': {
    '32-core GPU': '14-core CPU',
    '40-core GPU': '16-core CPU',
  },
  'M2': '8-core CPU',
};
