import { useState } from 'react';
import type { Machine, Monitor, InfoTab } from '../types';
import type { AIModelResult, CloudService } from '../types';
import MachineCard from './MachineCard';
import MonitorCard from './MonitorCard';
import AIModelTable from './AIModelTable';
import CloudPanel from './CloudPanel';
import CostsPanel from './CostsPanel';

interface InfoPanelProps {
  machines: Machine[];
  monitors: Monitor[];
  aiModels: AIModelResult[];
  cloudServices: CloudService[];
  selectedId: string | null;
  totalRam: number;
  onSelectMachine: (id: string) => void;
  onSelectMonitor: (id: string) => void;
  onToggleMachine: (id: string) => void;
  onUpdateMachine?: (id: string, updates: Partial<Machine>) => void;
  onAddMachine?: () => void;
  onRemoveMachine?: (id: string) => void;
}

export default function InfoPanel({
  machines,
  monitors,
  aiModels,
  cloudServices,
  selectedId,
  totalRam,
  onSelectMachine,
  onSelectMonitor,
  onToggleMachine,
  onUpdateMachine,
  onAddMachine,
  onRemoveMachine,
}: InfoPanelProps) {
  const [tab, setTab] = useState<InfoTab>('specs');
  const activeMachines = machines.filter((m) => m.active);

  const tabs: { id: InfoTab; label: string }[] = [
    { id: 'specs', label: 'Hardware' },
    { id: 'ai', label: 'AI Models' },
    { id: 'costs', label: 'Costs' },
    { id: 'cloud', label: 'Cloud' },
  ];

  // Config summary totals
  const totalRamNum = activeMachines.reduce((s, m) => s + parseInt(m.ram), 0);
  const totalCpuCores = activeMachines.reduce((s, m) => {
    const match = m.cpu.match(/(\d+)-core/);
    return s + (match ? parseInt(match[1]) : 0);
  }, 0);
  const totalGpuCores = activeMachines.reduce((s, m) => {
    const match = m.gpu.match(/(\d+)-core/);
    return s + (match ? parseInt(match[1]) : 0);
  }, 0);
  const totalStorageTB = activeMachines.reduce((s, m) => {
    const tbMatch = m.storage.match(/([\d.]+)TB/);
    const gbMatch = m.storage.match(/([\d.]+)GB/);
    if (tbMatch) return s + parseFloat(tbMatch[1]);
    if (gbMatch) return s + parseFloat(gbMatch[1]) / 1000;
    return s;
  }, 0);
  const combinedBandwidth = activeMachines.reduce((sum, m) => {
    const value = parseInt(m.bandwidth, 10);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,10,26,0.95)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>
          Setup Lab
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 16,
          }}
        >
          {totalRam}GB unified · {activeMachines.length} active
        </div>

        <div
          style={{
            marginBottom: 14,
            background: 'rgba(129,140,248,0.08)',
            border: '1px solid rgba(129,140,248,0.18)',
            borderRadius: 8,
            padding: '8px 10px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
          }}
        >
          {[
            { label: 'Machines', value: `${activeMachines.length}` },
            { label: 'Total RAM', value: `${totalRamNum}GB` },
            { label: 'Bandwidth', value: `${combinedBandwidth} GB/s` },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>{item.label}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#a5b4fc',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 6,
                border: 'none',
                background: tab === t.id ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.03)',
                color: tab === t.id ? '#818cf8' : 'rgba(255,255,255,0.35)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {tab === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Machines */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.2)',
                  }}
                >
                  Machines
                </div>
                {onAddMachine && (
                  <button
                    onClick={onAddMachine}
                    style={{
                      border: '1px solid rgba(129,140,248,0.35)',
                      background: 'rgba(129,140,248,0.12)',
                      color: '#a5b4fc',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    Add Machine
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {machines.map((m) => (
                  <MachineCard
                    key={m.id}
                    machine={m}
                    isSelected={selectedId === m.id}
                    onSelect={onSelectMachine}
                    onToggle={onToggleMachine}
                    onUpdate={onUpdateMachine}
                    onRemove={onRemoveMachine}
                    canRemove={machines.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Monitors */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.2)',
                  marginBottom: 8,
                }}
              >
                Monitors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {monitors.map((m) => (
                  <MonitorCard
                    key={m.id}
                    monitor={m}
                    isSelected={selectedId === m.id}
                    onSelect={onSelectMonitor}
                  />
                ))}
              </div>
            </div>

            {/* Config Summary */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.2)',
                  marginBottom: 8,
                }}
              >
                Config Summary
              </div>
              <div style={{
                background: 'rgba(129,140,248,0.06)',
                border: '1px solid rgba(129,140,248,0.12)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}>
                {[
                  { label: 'Total RAM', value: `${totalRamNum}GB` },
                  { label: 'CPU Cores', value: `${totalCpuCores} cores` },
                  { label: 'GPU Cores', value: `${totalGpuCores} cores` },
                  { label: 'Storage', value: totalStorageTB >= 1 ? `${totalStorageTB.toFixed(1)}TB` : `${Math.round(totalStorageTB * 1000)}GB` },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 800, color: '#818cf8',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'ai' && <AIModelTable models={aiModels} totalRam={totalRam} />}
        {tab === 'costs' && <CostsPanel machines={machines} aiModels={aiModels} />}
        {tab === 'cloud' && <CloudPanel services={cloudServices} />}
      </div>
    </div>
  );
}
