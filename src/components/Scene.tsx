"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import Phone from "./Phone";

interface SceneProps {
  onSelectApp: (slug: string) => void;
  selectedApp: string | null;
}

const DEFAULT_POS = new THREE.Vector3(0, 0, 0.28);

function CameraReset({
  active,
  controlsRef,
}: {
  active: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  useFrame(({ camera }) => {
    if (active) {
      camera.position.lerp(DEFAULT_POS, 0.07);
      controlsRef.current?.update();
    }
  });
  return null;
}

export default function Scene({ onSelectApp, selectedApp }: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 0.28], fov: 45 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 2]} intensity={1.8} castShadow />
      <directionalLight position={[-2, 3, -1]} intensity={0.6} />
      <directionalLight position={[-1, 2, -3]} intensity={0.7} color="#8a5a9e" />

      <Environment preset="city" environmentIntensity={1.5} />

      <Phone onSelectApp={onSelectApp} selectedApp={selectedApp} />

      <CameraReset active={!!selectedApp} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableRotate={!selectedApp}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
