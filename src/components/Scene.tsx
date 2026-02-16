import { useRef, useState, useEffect } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Html } from '@react-three/drei';
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
  scale: number;
  color: string;
}

interface LabelData {
  id: string;
  name: string;
  ram: string;
  position: [number, number, number];
}

function SelectionGlow({ data }: { data: GlowData }) {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const pulse = (Math.sin(clock.elapsedTime * 2.6) + 1) / 2;
    materialRef.current.opacity = 0.08 + pulse * 0.12;
  });

  return (
    <mesh position={data.position} rotation={[-Math.PI / 2, 0, 0]} scale={[data.scale, data.scale, 1]}>
      <circleGeometry args={[0.5, 64]} />
      <meshBasicMaterial ref={materialRef} color={data.color} transparent opacity={0.08} depthWrite={false} />
    </mesh>
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

      if (name.includes('wall') || name.includes('room')) {
        child.visible = false;
        return;
      }

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

  const getSelectedMachineGlow = (): GlowData | null => {
    if (!selectedId || !modelRef.current) return null;

    const selectedMachine = machines.find((machine) => machine.id === selectedId);
    if (!selectedMachine) return null;

    const meshKey = selectedMachine.meshName.toLowerCase();
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
    const width = Math.max(size.x, size.z);

    return {
      position: [center.x, Math.max(0.01, box.min.y + 0.01), center.z],
      scale: width * 1.5,
      color: selectedMachine.color,
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
        position: [center.x, box.max.y + 0.08, center.z],
      });
    }

    return labels;
  };

  const selectedMachine = machines.find((machine) => machine.id === selectedId) ?? null;
  const glowData = getSelectedMachineGlow();
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
        const show = hoveredId === label.id || selectedMachine?.id === label.id;
        if (!show) return null;

        return (
          <Html key={label.id} position={label.position} center distanceFactor={9}>
            <div
              style={{
                background: 'rgba(0,0,0,0.7)',
                borderRadius: 4,
                padding: '3px 8px',
                color: '#f1f5f9',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {`${label.name} · ${label.ram}`}
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
      camera={{ position: [2.8, 1.8, 2.8], fov: 38 }}
      style={{ background: 'linear-gradient(180deg, #050510 0%, #0d0d2b 40%, #151530 100%)' }}
      shadows
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[3, 6, 2]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-4, 4, -3]} intensity={0.3} color="#8090ff" />
      <pointLight position={[-1, 3, -4]} intensity={0.4} color="#c0a0ff" />
      <pointLight position={[0, 0.05, 0]} intensity={0.15} color="#818cf8" distance={3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[10, 96]} />
        <meshStandardMaterial color="#0a0a18" roughness={1} metalness={0} />
      </mesh>

      <DeskModel
        machines={machines}
        monitors={monitors}
        onSelectMachine={onSelectMachine}
        onSelectMonitor={onSelectMonitor}
        selectedId={selectedId}
      />

      <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={10} blur={2.5} far={5} resolution={512} />

      <OrbitControls
        makeDefault
        target={[0, 0.6, 0]}
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
