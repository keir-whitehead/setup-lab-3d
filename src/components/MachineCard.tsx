import type { Machine } from '../types';
import { CHIP_CONFIGS, STORAGE_OPTIONS, CHIP_PRICE_RANGES, CHIP_CPU_MAP } from '../types';

interface MachineCardProps {
  machine: Machine;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Machine>) => void;
  onRemove?: (id: string) => void;
  canRemove?: boolean;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#f8fafc',
  fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace",
  padding: '8px 10px',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.34)',
  marginBottom: 4,
};

const parseCoreCount = (value: string): number => {
  const match = value.match(/(\d+)-core/);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const parseRam = (ram: string): number => {
  const value = Number.parseInt(ram, 10);
  return Number.isFinite(value) ? value : 0;
};

const getFormFactor = (machine: Machine): string => {
  if (machine.name === 'MacBook Pro') return '16-inch Laptop';
  if (machine.name === 'MacBook Air') return '13-inch Laptop';
  if (machine.name === 'Mac Mini') return 'Compact Desktop';
  if (machine.name === 'Mac Studio') return 'Performance Desktop';
  if (machine.name === 'Mac Pro') return 'Tower Workstation';
  return machine.type === 'laptop' ? 'Laptop' : 'Desktop';
};

const getChipTier = (chip: string): 'base' | 'pro' | 'max' | 'ultra' => {
  if (chip.toLowerCase().includes('ultra')) return 'ultra';
  if (chip.toLowerCase().includes('max')) return 'max';
  if (chip.toLowerCase().includes('pro')) return 'pro';
  return 'base';
};

const resolveCpuForChip = (chip: string, gpu: string, fallback: string): string => {
  const cpuConfig = CHIP_CPU_MAP[chip];
  if (!cpuConfig) return fallback;
  if (typeof cpuConfig === 'string') return cpuConfig;
  return cpuConfig[gpu] ?? Object.values(cpuConfig)[0] ?? fallback;
};

const resolveBandwidth = (chip: string, ram: string, gpu: string, fallback: string): string => {
  const config = CHIP_CONFIGS[chip];
  if (!config) return fallback;
  if (config.gpuBandwidthMap?.[gpu]) return config.gpuBandwidthMap[gpu];
  return config.bandwidthMap[ram] ?? fallback;
};

const tierColors: Record<'base' | 'pro' | 'max' | 'ultra', string> = {
  base: '#94a3b8',
  pro: '#60a5fa',
  max: '#a78bfa',
  ultra: '#f472b6',
};

const ToggleSwitch = ({ active, onClick, color }: { active: boolean; onClick: () => void; color: string }) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    style={{
      width: 40,
      height: 22,
      borderRadius: 999,
      border: 'none',
      background: active ? color : 'rgba(255,255,255,0.16)',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 3,
        left: active ? 21 : 3,
        width: 16,
        height: 16,
        borderRadius: 999,
        background: '#ffffff',
        transition: 'left 0.2s ease',
      }}
    />
  </button>
);

export default function MachineCard({
  machine,
  isSelected,
  onSelect,
  onToggle,
  onUpdate,
  onRemove,
  canRemove = true,
}: MachineCardProps) {
  const chipConfig = CHIP_CONFIGS[machine.chip];
  const availableChips = Object.keys(CHIP_CONFIGS);
  const priceRange = CHIP_PRICE_RANGES[machine.chip];
  const chipTier = getChipTier(machine.chip);
  const neuralCores = parseCoreCount(machine.neural);
  const runBadge = parseRam(machine.ram) >= 96 ? 'Up to 70B models' : 'Up to 32B models';

  const handleChipChange = (newChip: string) => {
    if (!onUpdate) return;
    const config = CHIP_CONFIGS[newChip];
    if (!config) return;
    const newRam = config.ramOptions[0];
    const newGpu = config.gpuOptions[0];
    const newBandwidth = resolveBandwidth(newChip, newRam, newGpu, machine.bandwidth);
    const newCpu = resolveCpuForChip(newChip, newGpu, machine.cpu);

    onUpdate(machine.id, {
      chip: newChip,
      ram: newRam,
      gpu: newGpu,
      cpu: newCpu,
      bandwidth: newBandwidth,
    });
  };

  const handleRamChange = (newRam: string) => {
    if (!onUpdate || !chipConfig) return;
    const newBandwidth = resolveBandwidth(machine.chip, newRam, machine.gpu, machine.bandwidth);
    onUpdate(machine.id, { ram: newRam, bandwidth: newBandwidth });
  };

  const handleGpuChange = (newGpu: string) => {
    if (!onUpdate) return;
    const newBandwidth = resolveBandwidth(machine.chip, machine.ram, newGpu, machine.bandwidth);
    const newCpu = resolveCpuForChip(machine.chip, newGpu, machine.cpu);
    onUpdate(machine.id, { gpu: newGpu, cpu: newCpu, bandwidth: newBandwidth });
  };

  const handleStorageChange = (newStorage: string) => {
    if (!onUpdate) return;
    onUpdate(machine.id, { storage: newStorage });
  };

  if (!isSelected) {
    return (
      <div
        onClick={() => onSelect(machine.id)}
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          padding: '10px 12px',
          cursor: 'pointer',
          opacity: machine.active ? 1 : 0.55,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: machine.color,
            boxShadow: `0 0 8px ${machine.color}66`,
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700, minWidth: 100 }}>{machine.name}</span>
        <span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 11 }}>{machine.chip}</span>
        <span style={{ color: 'rgba(255,255,255,0.56)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          {machine.ram}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, marginLeft: 'auto' }}>{machine.bandwidth}</span>
        <ToggleSwitch active={machine.active} onClick={() => onToggle(machine.id)} color={machine.color} />
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(machine.id)}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${machine.color}`,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        padding: 14,
        cursor: 'pointer',
        position: 'relative',
        opacity: machine.active ? 1 : 0.75,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ color: '#f8fafc', fontSize: 18, fontWeight: 800 }}>{machine.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>{getFormFactor(machine)}</div>
        </div>
        <ToggleSwitch active={machine.active} onClick={() => onToggle(machine.id)} color={machine.color} />
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        <div>
          <div style={labelStyle}>Chip</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span
              style={{
                fontSize: 9,
                color: tierColors[chipTier],
                background: `${tierColors[chipTier]}22`,
                border: `1px solid ${tierColors[chipTier]}66`,
                borderRadius: 999,
                padding: '2px 7px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              {chipTier}
            </span>
          </div>
          <select
            value={machine.chip}
            onChange={(event) => handleChipChange(event.target.value)}
            style={selectStyle}
          >
            {availableChips.map((chip) => (
              <option key={chip} value={chip} style={{ background: '#151529' }}>
                {chip}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={labelStyle}>RAM</div>
          <select
            value={machine.ram}
            onChange={(event) => handleRamChange(event.target.value)}
            style={selectStyle}
          >
            {(chipConfig?.ramOptions ?? [machine.ram]).map((ramOption) => (
              <option key={ramOption} value={ramOption} style={{ background: '#151529' }}>
                {ramOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={labelStyle}>GPU</div>
          <select
            value={machine.gpu}
            onChange={(event) => handleGpuChange(event.target.value)}
            style={selectStyle}
          >
            {(chipConfig?.gpuOptions ?? [machine.gpu]).map((gpuOption) => (
              <option key={gpuOption} value={gpuOption} style={{ background: '#151529' }}>
                {gpuOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={labelStyle}>Storage</div>
          <select
            value={machine.storage}
            onChange={(event) => handleStorageChange(event.target.value)}
            style={selectStyle}
          >
            {STORAGE_OPTIONS.map((storage) => (
              <option key={storage} value={storage} style={{ background: '#151529' }}>
                {storage}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.32)',
            marginBottom: 8,
          }}
        >
          Specs
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'CPU cores', value: `${parseCoreCount(machine.cpu)}` },
            { label: 'GPU cores', value: `${parseCoreCount(machine.gpu)}` },
            { label: 'Neural cores', value: `${neuralCores || 16}` },
            { label: 'Bandwidth', value: machine.bandwidth },
          ].map((spec) => (
            <div key={spec.label}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.36)' }}>{spec.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
                {spec.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 11 }}>
            Price range:{' '}
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {priceRange ? `$${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}` : 'TBD'}
            </span>
          </div>
          <span
            style={{
              borderRadius: 999,
              border: '1px solid rgba(129,140,248,0.45)',
              color: '#c7d2fe',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              background: 'rgba(129,140,248,0.18)',
              whiteSpace: 'nowrap',
            }}
          >
            {runBadge}
          </span>
        </div>
      </div>

      {onRemove && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            if (canRemove) onRemove(machine.id);
          }}
          disabled={!canRemove}
          style={{
            marginTop: 10,
            border: 'none',
            background: 'transparent',
            color: canRemove ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.24)',
            fontSize: 11,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            cursor: canRemove ? 'pointer' : 'not-allowed',
            padding: 0,
          }}
        >
          Remove machine
        </button>
      )}
    </div>
  );
}
