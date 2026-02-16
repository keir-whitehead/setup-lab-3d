import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Machine, Monitor } from '../types';

interface DeskModelProps {
  machines: Machine[];
  monitors: Monitor[];
  onSelectMachine: (id: string) => void;
  onSelectMonitor: (id: string) => void;
  selectedId: string | null;
}

function DeskModel({ machines, monitors, onSelectMachine, onSelectMonitor, selectedId }: DeskModelProps) {
  const { scene } = useGLTF('/models/setup_lab.glb');
  const modelRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { gl } = useThree();

  // Build lookup of mesh names to machine/monitor ids
  const meshToMachine = new Map(machines.map((m) => [m.meshName.toLowerCase(), m]));
  const meshToMonitor = new Map(monitors.map((m) => [m.meshName.toLowerCase(), m]));

  // Set visibility based on active state
  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = child.name.toLowerCase();
      const machine = [...meshToMachine.entries()].find(([key]) => name.includes(key));
      if (machine) {
        child.visible = machine[1].active;
      }
    });
  }, [machines, meshToMachine]);

  // Update cursor on hover
  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered, gl]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    const name = mesh.name.toLowerCase();

    for (const [key, machine] of meshToMachine) {
      if (name.includes(key) && machine.active) {
        onSelectMachine(machine.id);
        return;
      }
    }
    for (const [key, monitor] of meshToMonitor) {
      if (name.includes(key)) {
        onSelectMonitor(monitor.id);
        return;
      }
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    const mesh = e.object as THREE.Mesh;
    const name = mesh.name.toLowerCase();
    const isInteractive = [...meshToMachine.keys(), ...meshToMonitor.keys()].some(
      (key) => name.includes(key)
    );
    if (isInteractive) {
      setHovered(name);
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
  };

  return (
    <group ref={modelRef}>
      <primitive
        object={scene}
        scale={1}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      {/* Selection highlight ring */}
      {selectedId && modelRef.current && (() => {
        let targetMesh: THREE.Object3D | null = null;
        const allItems = [...machines, ...monitors];
        const selected = allItems.find((item) => item.id === selectedId);
        if (!selected) return null;
        const meshName = 'meshName' in selected ? selected.meshName.toLowerCase() : '';
        modelRef.current?.traverse((child) => {
          if (child.name.toLowerCase().includes(meshName)) {
            targetMesh = child;
          }
        });
        if (!targetMesh) return null;
        const box = new THREE.Box3().setFromObject(targetMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, size.z) * 0.7;
        return (
          <mesh position={[center.x, box.min.y + 0.01, center.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.02, 64]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.6} />
          </mesh>
        );
      })()}
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <pointLight position={[0, 2, 0]} intensity={0.2} color="#818cf8" />

      <DeskModel
        machines={machines}
        monitors={monitors}
        onSelectMachine={onSelectMachine}
        onSelectMonitor={onSelectMonitor}
        selectedId={selectedId}
      />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.4}
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

      {/* Grid floor */}
      <gridHelper args={[10, 20, '#1a1a3e', '#1a1a3e']} position={[0, -0.02, 0]} />
    </Canvas>
  );
}

// Preload the model
useGLTF.preload('/models/setup_lab.glb');
