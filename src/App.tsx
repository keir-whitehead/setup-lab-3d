import { useState, useCallback, useMemo } from 'react';
import Scene from './components/Scene';
import InfoPanel from './components/InfoPanel';
import { INITIAL_MACHINES } from './data/machines';
import { INITIAL_MONITORS } from './data/monitors';
import { CLOUD_SERVICES, getAIModels } from './data/aiModels';
import type { Machine } from './types';

type MachineTemplateKey = 'MacBook Air' | 'MacBook Pro' | 'Mac Mini' | 'Mac Studio' | 'Mac Pro';

const MACHINE_TEMPLATES: Record<MachineTemplateKey, Omit<Machine, 'id'>> = {
  'MacBook Air': {
    name: 'MacBook Air',
    chip: 'M4',
    ram: '24GB',
    storage: '512GB SSD',
    cpu: '10-core CPU',
    gpu: '10-core GPU',
    neural: '16-core Neural Engine',
    type: 'laptop',
    display: '13.6" Liquid Retina',
    ports: '2x USB-C (Thunderbolt), MagSafe',
    color: '#10b981',
    bandwidth: '120 GB/s',
    role: 'Portable note-taking + local coding node',
    active: true,
    meshName: 'MacBook_Air',
  },
  'MacBook Pro': {
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
    role: 'Mobile workstation for model tuning and dev',
    active: true,
    meshName: 'MacBook_Pro',
  },
  'Mac Mini': {
    name: 'Mac Mini',
    chip: 'M4 Pro',
    ram: '48GB',
    storage: '512GB SSD',
    cpu: '14-core CPU',
    gpu: '20-core GPU',
    neural: '16-core Neural Engine',
    type: 'desktop',
    display: 'No built-in display',
    ports: '3x Thunderbolt 5, 2x USB-C, HDMI, Ethernet',
    color: '#f59e0b',
    bandwidth: '273 GB/s',
    role: 'Compact desktop / elastic worker node',
    active: true,
    meshName: 'Mac_Mini',
  },
  'Mac Studio': {
    name: 'Mac Studio',
    chip: 'M4 Ultra',
    ram: '192GB',
    storage: '2TB SSD',
    cpu: '28-core CPU',
    gpu: '60-core GPU',
    neural: '32-core Neural Engine',
    type: 'desktop',
    display: 'No built-in display',
    ports: '6x Thunderbolt 5, 2x USB-A, HDMI, Ethernet, SD',
    color: '#8b5cf6',
    bandwidth: '819 GB/s',
    role: 'Primary inference and orchestration node',
    active: true,
    meshName: 'Mac_Studio',
  },
  'Mac Pro': {
    name: 'Mac Pro',
    chip: 'M4 Ultra',
    ram: '256GB',
    storage: '4TB SSD',
    cpu: '32-core CPU',
    gpu: '80-core GPU',
    neural: '32-core Neural Engine',
    type: 'desktop',
    display: 'No built-in display',
    ports: '8x Thunderbolt 5, 2x HDMI, 10Gb Ethernet',
    color: '#f43f5e',
    bandwidth: '819 GB/s',
    role: 'Heavy frontier model host and cluster anchor',
    active: true,
    meshName: 'Mac_Studio',
  },
};

const parseBandwidth = (bandwidth: string): number => {
  const value = Number.parseInt(bandwidth, 10);
  return Number.isFinite(value) ? value : 0;
};

export default function App() {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const monitors = INITIAL_MONITORS;

  const activeMachines = useMemo(() => machines.filter((machine) => machine.active), [machines]);

  const totalRam = useMemo(
    () => activeMachines.reduce((sum, machine) => sum + Number.parseInt(machine.ram, 10), 0),
    [activeMachines]
  );

  const combinedBandwidth = useMemo(
    () => activeMachines.reduce((sum, machine) => sum + parseBandwidth(machine.bandwidth), 0),
    [activeMachines]
  );

  const aiModels = useMemo(() => getAIModels(activeMachines), [activeMachines]);

  const exoStatus = activeMachines.length >= 2 ? 'ready' : 'single node';

  const handleSelectMachine = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleSelectMonitor = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleMachine = useCallback((id: string) => {
    setMachines((prev) =>
      prev.map((machine) => (machine.id === id ? { ...machine, active: !machine.active } : machine))
    );
  }, []);

  const handleUpdateMachine = useCallback((id: string, updates: Partial<Machine>) => {
    setMachines((prev) =>
      prev.map((machine) => (machine.id === id ? { ...machine, ...updates } : machine))
    );
  }, []);

  const handleAddMachine = useCallback((templateKey: MachineTemplateKey) => {
    const template = MACHINE_TEMPLATES[templateKey];
    const id = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newMachine: Machine = {
      id,
      ...template,
    };
    setMachines((prev) => [...prev, newMachine]);
    setSelectedId(id);
  }, []);

  const handleRemoveMachine = useCallback((id: string) => {
    setMachines((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((machine) => machine.id !== id);
      return filtered.length === 0 ? prev : filtered;
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#090913' }}>
      <div style={{ flex: '0 0 60%', height: '100%', position: 'relative' }}>
        <Scene
          machines={machines}
          monitors={monitors}
          onSelectMachine={handleSelectMachine}
          onSelectMonitor={handleSelectMonitor}
          selectedId={selectedId}
        />

        <div
          style={{
            position: 'absolute',
            left: 24,
            bottom: 24,
            background: 'rgba(22, 22, 38, 0.55)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 0 28px rgba(129,140,248,0.18)',
          }}
        >
          <div
            style={{
              color: '#f8fafc',
              fontSize: 20,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {totalRam}GB
          </div>
          <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 11 }}>
            total RAM
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.14)' }} />
          <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 11 }}>
            {activeMachines.length} machines
          </div>
          <div style={{ color: 'rgba(255,255,255,0.74)', fontSize: 11 }}>
            {combinedBandwidth} GB/s
          </div>
          <div style={{ color: exoStatus === 'ready' ? '#a5b4fc' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>
            exo cluster: {exoStatus}
          </div>
        </div>
      </div>

      <div style={{ flex: '0 0 40%', height: '100%' }}>
        <InfoPanel
          machines={machines}
          monitors={monitors}
          aiModels={aiModels}
          cloudServices={CLOUD_SERVICES}
          selectedId={selectedId}
          totalRam={totalRam}
          onSelectMachine={handleSelectMachine}
          onSelectMonitor={handleSelectMonitor}
          onToggleMachine={handleToggleMachine}
          onUpdateMachine={handleUpdateMachine}
          onAddMachine={handleAddMachine}
          onRemoveMachine={handleRemoveMachine}
        />
      </div>
    </div>
  );
}
