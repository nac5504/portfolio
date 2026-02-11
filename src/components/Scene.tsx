"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import Phone from "./Phone";

// Camera positions
const IDLE_POS = new THREE.Vector3(0, 0.1, 0.55);
const FOCUSED_POS = new THREE.Vector3(0, 0.1, 0.25);
const IDLE_TARGET = new THREE.Vector3(0, 0.05, 0);
const FOCUSED_TARGET = new THREE.Vector3(0, 0.1, 0);

function CameraController({ focused }: { focused: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(IDLE_POS.clone());
  const targetLookAt = useRef(IDLE_TARGET.clone());
  const currentLookAt = useRef(IDLE_TARGET.clone());

  useEffect(() => {
    if (focused) {
      targetPos.current.copy(FOCUSED_POS);
      targetLookAt.current.copy(FOCUSED_TARGET);
    } else {
      targetPos.current.copy(IDLE_POS);
      targetLookAt.current.copy(IDLE_TARGET);
    }
  }, [focused]);

  useFrame((_, delta) => {
    const speed = 3;
    camera.position.lerp(targetPos.current, speed * delta);
    currentLookAt.current.lerp(targetLookAt.current, speed * delta);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

interface SceneContentProps {
  focused: boolean;
  onOpen: () => void;
  onSelectApp: (slug: string) => void;
}

function SceneContent({ focused, onOpen, onSelectApp }: SceneContentProps) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !focused;
    }
  }, [focused]);

  return (
    <>
      <CameraController focused={focused} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.5} castShadow />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} />

      <Environment preset="city" />

      <Phone onOpen={onOpen} focused={focused} onSelectApp={onSelectApp} />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

interface SceneProps {
  focused: boolean;
  onOpen: () => void;
  onSelectApp: (slug: string) => void;
}

export default function Scene({ focused, onOpen, onSelectApp }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 0.55], fov: 45 }}
      style={{ background: "#000" }}
    >
      <SceneContent
        focused={focused}
        onOpen={onOpen}
        onSelectApp={onSelectApp}
      />
    </Canvas>
  );
}
