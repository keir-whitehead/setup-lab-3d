import { useState } from 'react';
import type { Machine, Monitor, InfoTab } from '../types';
import type { AIModelResult, CloudService } from '../types';
import MachineCard from './MachineCard';
import MonitorCard from './MonitorCard';
import AIModelTable from './AIModelTable';
import CloudPanel from './CloudPanel';
import CostsPanel from './CostsPanel';

type MachineTemplateKey = 'MacBook Air' | 'MacBook Pro' | 'Mac Mini' | 'Mac Studio' | 'Mac Pro';

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
  onAddMachine?: (template: MachineTemplateKey) => void;
  onRemoveMachine?: (id: string) => void;
}

const MACHINE_OPTIONS: MachineTemplateKey[] = ['MacBook Air', 'MacBook Pro', 'Mac Mini', 'Mac Studio', 'Mac Pro'];
const MACHINE_COLORS: Record<MachineTemplateKey, string> = {
  'MacBook Air': '#10b981',
  'MacBook Pro': '#3b82f6',
  'Mac Mini': '#f59e0b',
  'Mac Studio': '#8b5cf6',
  'Mac Pro': '#f43f5e',
};

const parseBandwidth = (bandwidth: string): number => {
  const value = Number.parseInt(bandwidth, 10);
  return Number.isFinite(value) ? value : 0;
};

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

  const activeMachines = machines.filter((machine) => machine.active);
  const combinedBandwidth = activeMachines.reduce(
    (sum, machine) => sum + parseBandwidth(machine.bandwidth),
    0
  );
  const exoStatus = activeMachines.length >= 2 ? 'ready' : 'single';

  const tabs: { id: InfoTab; label: string }[] = [
    { id: 'specs', label: 'Hardware' },
    { id: 'ai', label: 'AI Models' },
    { id: 'costs', label: 'Costs' },
    { id: 'cloud', label: 'Cloud' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d1f',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          padding: '14px 24px 12px',
          borderBottom: '1px solid transparent',
          borderImage: 'linear-gradient(90deg, rgba(129,140,248,0), rgba(129,140,248,0.65), rgba(129,140,248,0)) 1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 24, lineHeight: 1, fontWeight: 800, color: '#f8fafc' }}>{totalRam}GB</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>unified memory</span>
        </div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>{activeMachines.length} machines</span>
          <span>·</span>
          <span>{combinedBandwidth} GB/s</span>
          <span>·</span>
          <span style={{ color: exoStatus === 'ready' ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}>
            exo {exoStatus}
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            background: '#1a1a2e',
            borderRadius: 999,
            padding: 4,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 4,
          }}
        >
          {tabs.map((tabOption) => {
            const active = tab === tabOption.id;
            return (
              <button
                key={tabOption.id}
                onClick={() => setTab(tabOption.id)}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  padding: '8px 6px',
                  background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                {tabOption.label}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .info-panel-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .info-panel-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .info-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .info-panel-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
      `}</style>

      <div className="info-panel-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {tab === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)',
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                Machines
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {machines.map((machine) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    isSelected={selectedId === machine.id}
                    onSelect={onSelectMachine}
                    onToggle={onToggleMachine}
                    onUpdate={onUpdateMachine}
                    onRemove={onRemoveMachine}
                    canRemove={machines.length > 1}
                  />
                ))}

                <div style={{ paddingTop: 2 }}>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.34)',
                      marginBottom: 8,
                      fontWeight: 700,
                    }}
                  >
                    Add Machine
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {MACHINE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => onAddMachine?.(option)}
                        style={{
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.04)',
                          color: '#f8fafc',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '7px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 999,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${MACHINE_COLORS[option]}2a`,
                            color: MACHINE_COLORS[option],
                            fontSize: 11,
                            lineHeight: 1,
                            fontWeight: 800,
                          }}
                        >
                          +
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)',
                  marginBottom: 10,
                  fontWeight: 700,
                }}
              >
                Monitors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monitors.map((monitor) => (
                  <MonitorCard
                    key={monitor.id}
                    monitor={monitor}
                    isSelected={selectedId === monitor.id}
                    onSelect={onSelectMonitor}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'ai' && <AIModelTable models={aiModels} totalRam={totalRam} activeMachineCount={activeMachines.length} />}
        {tab === 'costs' && <CostsPanel machines={machines} aiModels={aiModels} />}
        {tab === 'cloud' && <CloudPanel services={cloudServices} />}
      </div>
    </div>
  );
}
