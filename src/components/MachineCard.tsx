import { useState } from 'react';
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
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5,
  color: '#e2e8f0',
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  padding: '4px 6px',
  cursor: 'pointer',
  outline: 'none',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: 3,
};

const resolveCpuForChip = (chip: string, gpu: string, fallback: string) => {
  const cpuConfig = CHIP_CPU_MAP[chip];
  if (!cpuConfig) return fallback;
  if (typeof cpuConfig === 'string') return cpuConfig;
  return cpuConfig[gpu] ?? Object.values(cpuConfig)[0] ?? fallback;
};

const resolveBandwidth = (chip: string, ram: string, gpu: string, fallback: string) => {
  const config = CHIP_CONFIGS[chip];
  if (!config) return fallback;
  if (config.gpuBandwidthMap?.[gpu]) return config.gpuBandwidthMap[gpu];
  return config.bandwidthMap[ram] ?? fallback;
};

export default function MachineCard({
  machine,
  isSelected,
  onSelect,
  onToggle,
  onUpdate,
  onRemove,
  canRemove = true,
}: MachineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const chipConfig = CHIP_CONFIGS[machine.chip];
  const priceRange = CHIP_PRICE_RANGES[machine.chip];
  const availableChips = Object.keys(CHIP_CONFIGS);

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
      cpu: newCpu,
      gpu: newGpu,
      ram: newRam,
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
    onUpdate(machine.id, { gpu: newGpu, bandwidth: newBandwidth, cpu: newCpu });
  };

  const handleStorageChange = (newStorage: string) => {
    if (!onUpdate) return;
    onUpdate(machine.id, { storage: newStorage });
  };

  return (
    <div
      onClick={() => onSelect(machine.id)}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${machine.color}15, ${machine.color}08)`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? machine.color + '44' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: machine.active ? 1 : 0.4,
        position: 'relative',
        borderImage: isSelected
          ? `linear-gradient(135deg, ${machine.color}66, ${machine.color}22) 1`
          : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
              {machine.name}
            </div>
            {isSelected && machine.active && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 9,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {expanded ? '▲ Config' : '▼ Config'}
              </button>
            )}
          </div>
          <div
            style={{
              fontSize: 10,
              color: machine.color,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {machine.chip} · {machine.ram}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canRemove) onRemove(machine.id);
              }}
              disabled={!canRemove}
              style={{
                border: '1px solid rgba(239,68,68,0.35)',
                background: canRemove ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                color: canRemove ? '#fca5a5' : 'rgba(255,255,255,0.2)',
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 7px',
                cursor: canRemove ? 'pointer' : 'not-allowed',
              }}
            >
              Remove
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(machine.id);
            }}
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              border: 'none',
              background: machine.active ? machine.color : 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: machine.active ? 16 : 2,
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </div>
      </div>

      {isSelected && machine.active && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.8,
          }}
        >
          <div>{machine.cpu} · {machine.gpu}</div>
          <div>{machine.storage}</div>
          <div>{machine.bandwidth} bandwidth</div>
          <div>{machine.display}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
            {machine.ports}
          </div>
          <div style={{ fontSize: 10, color: machine.color, marginTop: 4, fontStyle: 'italic' }}>
            {machine.role}
          </div>
          {priceRange && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              Est. ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Config Panel */}
      {isSelected && machine.active && expanded && onUpdate && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          <div>
            <div style={labelStyle}>Chip</div>
            <select
              value={machine.chip}
              onChange={(e) => handleChipChange(e.target.value)}
              style={selectStyle}
            >
              {availableChips.map((c) => (
                <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>RAM</div>
            <select
              value={machine.ram}
              onChange={(e) => handleRamChange(e.target.value)}
              style={selectStyle}
            >
              {(chipConfig?.ramOptions ?? [machine.ram]).map((r) => (
                <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>GPU</div>
            <select
              value={machine.gpu}
              onChange={(e) => handleGpuChange(e.target.value)}
              style={selectStyle}
            >
              {(chipConfig?.gpuOptions ?? [machine.gpu]).map((g) => (
                <option key={g} value={g} style={{ background: '#1a1a2e' }}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Storage</div>
            <select
              value={machine.storage}
              onChange={(e) => handleStorageChange(e.target.value)}
              style={selectStyle}
            >
              {STORAGE_OPTIONS.map((s) => (
                <option key={s} value={s} style={{ background: '#1a1a2e' }}>{s}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 4,
            }}>
              Bandwidth: {machine.bandwidth}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
