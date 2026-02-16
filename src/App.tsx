import { useState, useCallback, useMemo } from 'react';
import Scene from './components/Scene';
import InfoPanel from './components/InfoPanel';
import { INITIAL_MACHINES } from './data/machines';
import { INITIAL_MONITORS } from './data/monitors';
import { CLOUD_SERVICES, getAIModels } from './data/aiModels';
import type { Machine } from './types';

export default function App() {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const monitors = INITIAL_MONITORS;

  const activeMachines = useMemo(() => machines.filter((m) => m.active), [machines]);

  const totalRam = useMemo(
    () => activeMachines.reduce((sum, m) => sum + parseInt(m.ram), 0),
    [activeMachines]
  );

  const maxSingleMachine = useMemo(
    () => Math.max(...activeMachines.map((m) => parseInt(m.ram)), 0),
    [activeMachines]
  );

  const studioCount = useMemo(
    () => activeMachines.filter((m) => m.name.includes('Studio')).length,
    [activeMachines]
  );

  const aiModels = useMemo(
    () => getAIModels(totalRam, maxSingleMachine, activeMachines.length, studioCount),
    [totalRam, maxSingleMachine, activeMachines.length, studioCount]
  );

  const handleSelectMachine = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleSelectMonitor = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleMachine = useCallback((id: string) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  }, []);

  const handleUpdateMachine = useCallback((id: string, updates: Partial<Machine>) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const handleAddMachine = useCallback(() => {
    const id = `mac-mini-${Date.now()}`;
    const newMachine: Machine = {
      id,
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
    };
    setMachines((prev) => [...prev, newMachine]);
    setSelectedId(id);
  }, []);

  const handleRemoveMachine = useCallback((id: string) => {
    setMachines((prev) => {
      if (prev.length <= 1) return prev;
      const filtered = prev.filter((m) => m.id !== id);
      return filtered.length === 0 ? prev : filtered;
    });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      {/* 3D Canvas — left 70% */}
      <div style={{ flex: '0 0 70%', height: '100%', position: 'relative' }}>
        <Scene
          machines={machines}
          monitors={monitors}
          onSelectMachine={handleSelectMachine}
          onSelectMonitor={handleSelectMonitor}
          selectedId={selectedId}
        />
        {/* RAM counter overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            background: 'rgba(10,10,26,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#818cf8',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {totalRam}GB
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            unified memory · {activeMachines.length} machines
          </span>
        </div>
      </div>

      {/* Info Panel — right 30% */}
      <div style={{ flex: '0 0 30%', height: '100%' }}>
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
