"use client";

import { useMemo, useRef, useState, useEffect, useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { createDisplayGeometry, createScreenTexture, targetAtUV, SCREEN_WIDTH } from "./phone-display";

// Helper to handle basePath for GitHub Pages deployment
const getAssetPath = (path: string) => {
  const basePath = '/portfolio';
  return `${basePath}${path}`;
};

const MODEL_PATH = getAssetPath("/models/iphone-17-pro.glb");

import { apps } from "./app-data";
export { apps } from "./app-data";

interface PhoneProps {
  onSelectApp: (slug: string) => void;
  selectedApp: string | null;
  isMobile?: boolean;
  onEntranceComplete?: () => void;
  onDisplayReady?: (mesh: THREE.Mesh) => void;
}

export default function Phone({ onSelectApp, selectedApp, isMobile, onEntranceComplete, onDisplayReady }: PhoneProps) {
  const { scene: cachedScene } = useGLTF(MODEL_PATH);
  // Each instance owns its scene and display resources. Never mutate useGLTF's cache.
  const scene = useMemo(() => cachedScene.clone(true), [cachedScene]);
  const gl = useThree(state => state.gl);
  const display = useRef<{
    mesh: THREE.Mesh;
    height: number;
    screen: ReturnType<typeof createScreenTexture>;
  } | null>(null);

  useLayoutEffect(() => {
    const candidates: THREE.Mesh[] = [];
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && !Array.isArray(child.material) && child.material.name === "Display") {
        candidates.push(child);
      }
    });
    if (candidates.length !== 1) throw new Error("Expected exactly one Display mesh in the phone model.");
    const mesh = candidates[0];
    const originalGeometry = mesh.geometry;
    const originalMaterial = mesh.material;
    const { geometry, aspect } = createDisplayGeometry(originalGeometry);
    const height = SCREEN_WIDTH * aspect;
    const screen = createScreenTexture(apps, height, gl.capabilities.getMaxAnisotropy());
    const material = new THREE.MeshBasicMaterial({
      map: screen.texture,
      // This GLB's display winding faces inward; render only the outward side.
      side: THREE.BackSide,
      toneMapped: false,
    });
    // The asset has a separate tinted cover glass. Keep its physical highlights,
    // but let pointer rays pass through it to the actual display underneath.
    const glass = scene.getObjectByName("Object_53");
    if (!(glass instanceof THREE.Mesh) || Array.isArray(glass.material) || glass.material.name !== "Glass") {
      throw new Error("The phone model's front cover glass has changed; inspect its screen binding.");
    }
    const originalGlassMaterial = glass.material;
    const originalGlassRaycast = glass.raycast;
    const glassMaterial = originalGlassMaterial.clone();
    glassMaterial.opacity = 0.06;
    glassMaterial.depthWrite = false;
    glass.material = glassMaterial;
    glass.raycast = () => {};
    mesh.geometry = geometry;
    mesh.material = material;
    display.current = { mesh, height, screen };
    onDisplayReady?.(mesh);
    return () => {
      display.current = null;
      mesh.geometry = originalGeometry;
      mesh.material = originalMaterial;
      glass.material = originalGlassMaterial;
      glass.raycast = originalGlassRaycast;
      glassMaterial.dispose();
      geometry.dispose();
      material.dispose();
      screen.dispose();
      gl.domElement.style.removeProperty("cursor");
    };
  }, [scene, gl, onDisplayReady]);

  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const entranceSpring = useSpring({
    y: hasEntered ? 0 : -2.5,
    rotationY: hasEntered ? 0 : Math.PI * 5,
    config: { mass: 1.8, tension: 140, friction: 32, clamp: false },
    onRest: () => { if (hasEntered) onEntranceComplete?.(); },
  });
  const spring = useSpring({
    positionX: selectedApp && !isMobile ? -0.09 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  function hit(event: ThreeEvent<PointerEvent | MouseEvent>) {
    const current = display.current;
    // Only the nearest physical surface can receive input: no clicks through the back.
    if (!current || event.object !== current.mesh || !event.uv) return undefined;
    return targetAtUV(current.screen.targets, event.uv, current.height);
  }

  return (
    <animated.group position-x={spring.positionX} position-y={entranceSpring.y} rotation-y={entranceSpring.rotationY}>
      <primitive
        object={scene}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.delta > 5) return; // Orbit drags must never launch an app.
          const target = hit(event);
          if (target?.slug) onSelectApp(target.slug);
          if (target?.href) window.open(target.href, "_blank", "noopener,noreferrer");
        }}
        onPointerMove={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          const target = hit(event);
          display.current?.screen.hover(target);
          gl.domElement.style.setProperty("cursor", target ? "pointer" : "grab");
        }}
        onPointerOut={() => {
          display.current?.screen.hover(undefined);
          gl.domElement.style.removeProperty("cursor");
        }}
      />
    </animated.group>
  );
}
