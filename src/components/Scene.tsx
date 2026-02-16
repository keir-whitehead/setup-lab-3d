import { useRef, useState, useEffect } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { Machine, Monitor } from '../types';

interface DeskModelProps {
  machines: Machine[];
  monitors: Monitor[];
  onSelectMachine: (id: string) => void;
  onSelectMonitor: (id: string) => void;
  selectedId: string | null;
}

interface RingData {
  position: [number, number, number];
  radius: number;
  color: string;
}

interface LabelData {
  id: string;
  name: string;
  ram: string;
  color: string;
  position: [number, number, number];
}

function PulsingSelectionRing({ data }: { data: RingData }) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!materialRef.current) return;
    const pulse = 0.45 + Math.sin(state.clock.elapsedTime * 3.2) * 0.25;
    materialRef.current.opacity = Math.max(0.15, pulse);
  });

  return (
    <mesh position={data.position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[data.radius, data.radius + 0.03, 64]} />
      <meshBasicMaterial ref={materialRef} color={data.color} transparent opacity={0.45} />
    </mesh>
  );
}

function DeskModel({ machines, monitors, onSelectMachine, onSelectMonitor, selectedId }: DeskModelProps) {
  const { scene } = useGLTF('/models/setup_lab.glb');
  const modelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { gl } = useThree();

  const machineEntries = machines.map((m) => [m.meshName.toLowerCase(), m] as const);
  const monitorEntries = monitors.map((m) => [m.meshName.toLowerCase(), m] as const);

  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = child.name.toLowerCase();
      const machineEntry = machineEntries.find(([key]) => name.includes(key));
      if (machineEntry) {
        child.visible = machineEntry[1].active;
      }
    });
  }, [machineEntries]);

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered, gl]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const name = e.object.name.toLowerCase();

    for (const [key, machine] of machineEntries) {
      if (name.includes(key) && machine.active) {
        onSelectMachine(machine.id);
        return;
      }
    }

    for (const [key, monitor] of monitorEntries) {
      if (name.includes(key)) {
        onSelectMonitor(monitor.id);
        return;
      }
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const name = e.object.name.toLowerCase();
    const isInteractive = [...machineEntries.map(([key]) => key), ...monitorEntries.map(([key]) => key)].some(
      (key) => name.includes(key)
    );
    if (isInteractive) {
      setHovered(name);
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
  };

  const getRingData = (): RingData | null => {
    if (!selectedId || !modelRef.current) return null;

    const selectedMachine = machines.find((m) => m.id === selectedId);
    const selectedMonitor = monitors.find((m) => m.id === selectedId);
    const selected = selectedMachine ?? selectedMonitor;
    if (!selected) return null;

    const meshKey = selected.meshName.toLowerCase();
    let target: THREE.Object3D | null = null;

    modelRef.current.traverse((child) => {
      if (target) return;
      if (child.name.toLowerCase().includes(meshKey)) {
        target = child;
      }
    });

    if (!target) return null;

    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    return {
      position: [center.x, box.min.y + 0.01, center.z],
      radius: Math.max(size.x, size.z) * 0.72,
      color: selectedMachine?.color ?? '#818cf8',
    };
  };

  const getLabels = (): LabelData[] => {
    if (!modelRef.current) return [];

    const labels: LabelData[] = [];
    const uniqueActiveMachines = new Map<string, Machine>();
    for (const machine of machines) {
      if (machine.active && !uniqueActiveMachines.has(machine.meshName)) {
        uniqueActiveMachines.set(machine.meshName, machine);
      }
    }

    for (const machine of uniqueActiveMachines.values()) {
      const meshKey = machine.meshName.toLowerCase();
      let target: THREE.Object3D | null = null;

      modelRef.current.traverse((child) => {
        if (target) return;
        if (child.name.toLowerCase().includes(meshKey) && child.visible) {
          target = child;
        }
      });

      if (!target) continue;

      const box = new THREE.Box3().setFromObject(target);
      const center = box.getCenter(new THREE.Vector3());
      labels.push({
        id: machine.id,
        name: machine.name,
        ram: machine.ram,
        color: machine.color,
        position: [center.x, box.max.y + 0.12, center.z],
      });
    }

    return labels;
  };

  const ringData = getRingData();
  const labels = getLabels();

  return (
    <group ref={modelRef}>
      <primitive
        object={scene}
        scale={1}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

      {ringData && <PulsingSelectionRing data={ringData} />}

      {labels.map((label) => (
        <Html key={label.id} position={label.position} center distanceFactor={8}>
          <div
            style={{
              background: 'rgba(10,10,26,0.88)',
              border: `1px solid ${label.color}66`,
              borderRadius: 7,
              padding: '4px 7px',
              color: '#f1f5f9',
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: `0 0 14px ${label.color}22`,
            }}
          >
            {label.name} · {label.ram}
          </div>
        </Html>
      ))}
    </group>
  );
}

interface SceneProps {
  machines: Machine[];
  monitors: Monitor[];
  onSelectMachine: (id: string) => void;
  onSelectMonitor: (id: string) => void;
  selectedId: string | null;
}

export default function Scene({ machines, monitors, onSelectMachine, onSelectMonitor, selectedId }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [3, 3, 3], fov: 45 }}
      style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #1a0a2e 100%)' }}
      shadows
    >
      <ambientLight intensity={0.32} />
      <pointLight position={[2.8, 2.6, 1.8]} intensity={0.75} color="#ffd8a8" castShadow />
      <pointLight position={[-2.5, 2.2, -1.8]} intensity={0.45} color="#9ad5ff" />
      <directionalLight position={[4.5, 6.2, 3.6]} intensity={0.4} color="#fff2dd" />

      <Sparkles count={85} scale={[8, 3, 8]} size={2.1} speed={0.25} color="#a5b4fc" />

      <DeskModel
        machines={machines}
        monitors={monitors}
        onSelectMachine={onSelectMachine}
        onSelectMonitor={onSelectMonitor}
        selectedId={selectedId}
      />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.42}
        scale={10}
        blur={2}
        far={4}
      />

      <Environment preset="city" />
      <OrbitControls
        makeDefault
        minDistance={1.5}
        maxDistance={8}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.05}
      />

      <gridHelper args={[10, 20, '#1a1a3e', '#1a1a3e']} position={[0, -0.02, 0]} />
    </Canvas>
  );
}

useGLTF.preload('/models/setup_lab.glb');
