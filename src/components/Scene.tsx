"use client";

import { useCallback, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import Phone, { apps } from "./Phone";
import { socials } from "./phone-display";

interface SceneProps {
  onSelectApp: (slug: string) => void;
  selectedApp: string | null;
  isMobile?: boolean;
  zoomIntoScreen?: boolean;
  onEntranceComplete?: () => void;
  onZoomComplete?: () => void;
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

// Fit the actual display bounds to the viewport, rather than a hand-tuned zoom.
function ScreenZoom({ active, displayRef, onComplete }: {
  active: boolean; displayRef: React.RefObject<THREE.Mesh | null>; onComplete?: () => void;
}) {
  const progress = useRef(0);
  const start = useRef<THREE.Vector3 | null>(null);
  const target = useRef(new THREE.Vector3());
  useFrame(({ camera }, delta) => {
    if (!active || !displayRef.current || progress.current >= 1 || !(camera instanceof THREE.PerspectiveCamera)) return;
    if (!start.current) start.current = camera.position.clone();
    // Recalculate on every frame so rotation/resizing during the zoom also fits.
    displayRef.current.updateWorldMatrix(true, false);
    const bounds = new THREE.Box3().setFromObject(displayRef.current);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distance = Math.min(size.y / (2 * tangent), size.x / (2 * tangent * camera.aspect));
    target.current.copy(center).add(new THREE.Vector3(0, 0, distance));
    progress.current = Math.min(1, progress.current + delta / 1.05);
    const t = progress.current;
    const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(start.current, target.current, eased);
    if (t === 1) onComplete?.();
  });
  return null;
}

export default function Scene({ onSelectApp, selectedApp, isMobile, zoomIntoScreen, onEntranceComplete, onZoomComplete }: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const displayRef = useRef<THREE.Mesh | null>(null);
  const onDisplayReady = useCallback((mesh: THREE.Mesh) => { displayRef.current = mesh; }, []);

  return (
    <>
    {!isMobile && <nav aria-label="Phone apps and social links" className="phone-keyboard-nav">
      {apps.map(app => <button key={app.slug} onClick={() => onSelectApp(app.slug)}>{app.name}</button>)}
      {socials.map(social => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer">{social.name}</a>)}
    </nav>}
    <Canvas
      camera={{ position: [0, 0, 0.28], fov: 45, near: 0.001, far: 10 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 2]} intensity={1.8} castShadow />
      <directionalLight position={[-2, 3, -1]} intensity={0.6} />
      <directionalLight position={[-1, 2, -3]} intensity={0.7} color="#8a5a9e" />

      <Environment preset="city" environmentIntensity={1.5} />

      <Phone onSelectApp={onSelectApp} selectedApp={selectedApp} isMobile={isMobile} onEntranceComplete={onEntranceComplete} onDisplayReady={onDisplayReady} />
      <ScreenZoom active={!!zoomIntoScreen} displayRef={displayRef} onComplete={onZoomComplete} />

      <CameraReset active={!!selectedApp} controlsRef={controlsRef} />

      {!zoomIntoScreen && <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableRotate={!selectedApp && !isMobile}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />}
    </Canvas>
    </>
  );
}
