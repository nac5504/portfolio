"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import HomeScreen from "./HomeScreen";

const PHONE_SCALE = 0.15;

interface PhoneProps {
  onOpen: () => void;
  focused: boolean;
  onSelectApp: (slug: string) => void;
}

export default function Phone({ onOpen, focused, onSelectApp }: PhoneProps) {
  const { scene } = useGLTF("/models/iphone_17_pro_max.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const targetRotationY = useRef(0);

  // Find screen mesh and compute its bounds in group-local space
  const screenInfo = useMemo(() => {
    scene.updateMatrixWorld(true);

    let screenMesh: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.name.toLowerCase().includes("screen")
      ) {
        screenMesh = child;
      }
    });

    if (!screenMesh) {
      console.warn("No screen mesh found in GLB model");
      return null;
    }

    // Bounding box in model space (before primitive scale)
    const box = new THREE.Box3().setFromObject(screenMesh);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    console.log("Screen mesh found:", screenMesh.name);
    console.log("Screen center (model space):", center.toArray());
    console.log("Screen size (model space):", size.toArray());

    // Apply primitive scale to get group-local coords
    center.multiplyScalar(PHONE_SCALE);
    size.multiplyScalar(PHONE_SCALE);

    console.log("Screen center (scaled):", center.toArray());
    console.log("Screen size (scaled):", size.toArray());

    // Determine which axes are width/height (the two largest dimensions)
    // The smallest dimension is depth (the flat plane direction)
    const dims = [
      { axis: "x" as const, val: size.x },
      { axis: "y" as const, val: size.y },
      { axis: "z" as const, val: size.z },
    ].sort((a, b) => b.val - a.val);

    const screenWidth = dims[1].val;
    const screenHeight = dims[0].val;
    const normalAxis = dims[2].axis;

    console.log("Screen width:", screenWidth, "height:", screenHeight, "normal:", normalAxis);

    return {
      center,
      screenWidth,
      screenHeight,
      normalAxis,
      mesh: screenMesh as THREE.Mesh,
    };
  }, [scene]);

  // Replace screen material with dark screen
  useEffect(() => {
    if (screenInfo?.mesh) {
      (screenInfo.mesh as THREE.Mesh).material = new THREE.MeshBasicMaterial({
        color: 0x111111,
      });
    }
  }, [screenInfo]);

  // Rotation + snap to front when focused
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (focused) {
      // Snap rotation to face front (screen toward camera = rotation.y = 0)
      // Smoothly lerp to the nearest front-facing angle
      const current = groupRef.current.rotation.y;
      // Normalize to find closest multiple of 2*PI that puts us near 0
      const twoPi = Math.PI * 2;
      const normalized = ((current % twoPi) + twoPi) % twoPi;
      // Target: closest front-facing angle (0 or 2PI)
      const target = normalized > Math.PI ? twoPi : 0;
      const fullTarget = current - normalized + target;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        current,
        fullTarget,
        5 * delta
      );
    } else {
      // Slow idle rotation
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={PHONE_SCALE}
        onPointerOver={(e: THREE.Event) => {
          e.stopPropagation();
          if (!focused) {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={(e: THREE.Event) => {
          e.stopPropagation();
          if (!focused) {
            onOpen();
            document.body.style.cursor = "default";
          }
        }}
      />

      {focused && screenInfo && (
        <HomeScreen
          position={screenInfo.center}
          screenWidth={screenInfo.screenWidth}
          screenHeight={screenInfo.screenHeight}
          normalAxis={screenInfo.normalAxis}
          onSelect={onSelectApp}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/iphone_17_pro_max.glb");
