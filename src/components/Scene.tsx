import { useRef, useState, useEffect } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Machine, Monitor } from '../types';

interface DeskModelProps {
  machines: Machine[];
  monitors: Monitor[];
  onSelectMachine: (id: string) => void;
  onSelectMonitor: (id: string) => void;
  selectedId: string | null;
}

interface GlowData {
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

function SelectionGlow({ data }: { data: GlowData }) {
  return (
    <group position={data.position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[data.radius * 1.3, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <circleGeometry args={[data.radius, 64]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

function DeskModel({ machines, monitors, onSelectMachine, onSelectMonitor, selectedId }: DeskModelProps) {
  const { scene } = useGLTF('/models/setup_lab.glb');
  const modelRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { gl } = useThree();

  const machineEntries = machines.map((machine) => [machine.meshName.toLowerCase(), machine] as const);
  const monitorEntries = monitors.map((monitor) => [monitor.meshName.toLowerCase(), monitor] as const);

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
    gl.domElement.style.cursor = hoveredId ? 'pointer' : 'auto';
  }, [hoveredId, gl]);

  const getInteractiveTarget = (objectName: string) => {
    for (const [key, machine] of machineEntries) {
      if (objectName.includes(key) && machine.active) {
        return { type: 'machine' as const, id: machine.id };
      }
    }

    for (const [key, monitor] of monitorEntries) {
      if (objectName.includes(key)) {
        return { type: 'monitor' as const, id: monitor.id };
      }
    }

    return null;
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const target = getInteractiveTarget(event.object.name.toLowerCase());
    if (!target) return;

    if (target.type === 'machine') {
      onSelectMachine(target.id);
      return;
    }

    onSelectMonitor(target.id);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = getInteractiveTarget(event.object.name.toLowerCase());
    if (target) {
      setHoveredId(target.id);
    }
  };

  const handlePointerOut = () => {
    setHoveredId(null);
  };

  const getGlowData = (): GlowData | null => {
    if (!selectedId || !modelRef.current) return null;

    const selectedMachine = machines.find((machine) => machine.id === selectedId);
    const selectedMonitor = monitors.find((monitor) => monitor.id === selectedId);
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
      position: [center.x, box.min.y + 0.012, center.z],
      radius: Math.max(size.x, size.z) * 0.75,
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
        position: [center.x, box.max.y + 0.08, center.z],
      });
    }

    return labels;
  };

  const glowData = getGlowData();
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

      {glowData && <SelectionGlow data={glowData} />}

      {labels.map((label) => {
        const show = hoveredId === label.id || selectedId === label.id;
        if (!show) return null;

        return (
          <Html key={label.id} position={label.position} center distanceFactor={9}>
            <div
              style={{
                background: 'rgba(10, 10, 26, 0.74)',
                border: `1px solid ${label.color}40`,
                borderRadius: 999,
                padding: '3px 8px',
                color: '#f1f5f9',
                fontSize: 9,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                opacity: 0.7,
                boxShadow: `0 0 10px ${label.color}22`,
                pointerEvents: 'none',
              }}
            >
              {label.name} {label.ram}
            </div>
          </Html>
        );
      })}
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
      camera={{ position: [2.5, 2, 2.5], fov: 40 }}
      style={{ background: 'radial-gradient(circle at 20% 0%, #151537 0%, #0a0a1a 60%, #080812 100%)' }}
      shadows
    >
      <fog attach="fog" args={['#0a0a1a', 5, 20]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 3]} intensity={0.6} color="#fff5e8" castShadow />
      <pointLight position={[-4, 3, -2]} intensity={0.2} color="#b0c4ff" />
      <pointLight position={[0, 4, -5]} intensity={0.3} color="#dbeafe" />
      <pointLight position={[0, 0.1, 0]} intensity={0.1} color="#818cf8" />

      <DeskModel
        machines={machines}
        monitors={monitors}
        onSelectMachine={onSelectMachine}
        onSelectMonitor={onSelectMonitor}
        selectedId={selectedId}
      />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={10} blur={3} far={4} />

      <Environment preset="night" />
      <OrbitControls
        makeDefault
        target={[0, 0.5, 0]}
        minDistance={1.4}
        maxDistance={7.5}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

useGLTF.preload('/models/setup_lab.glb');
