"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";

const apps = [
  { name: "Cravr", slug: "cravr", color: "#FF6B6B", emoji: "🧠" },
  { name: "Nomad", slug: "nomad", color: "#4ECDC4", emoji: "🗺️" },
  { name: "FlavorFeed", slug: "flavorfeed", color: "#FFE66D", emoji: "🍕" },
  { name: "Guess-E", slug: "guess-e", color: "#A8E6CF", emoji: "🎨" },
  { name: "mal", slug: "mal", color: "#DDA0DD", emoji: "📚" },
  { name: "Letter Day", slug: "letterday", color: "#87CEEB", emoji: "📅" },
];

// Fixed pixel dimensions for the HTML UI
const HTML_WIDTH = 300;
const HTML_HEIGHT = 620;

interface HomeScreenProps {
  position: THREE.Vector3;
  screenWidth: number;
  screenHeight: number;
  normalAxis: string;
  onSelect: (slug: string) => void;
}

export default function HomeScreen({
  position,
  screenWidth,
  screenHeight,
  normalAxis,
  onSelect,
}: HomeScreenProps) {
  // Compute the 3D scale so the HTML div matches the screen mesh size
  // Html `transform` mode renders at 1px = 1 Three.js unit by default,
  // then we scale it down so the HTML_WIDTH px = screenWidth 3D units
  const scaleX = screenWidth / HTML_WIDTH;
  const scaleY = screenHeight / HTML_HEIGHT;
  const htmlScale = Math.min(scaleX, scaleY);

  console.log("HomeScreen rendering at:", [position.x, position.y, position.z], "scale:", htmlScale, "screenW:", screenWidth, "screenH:", screenHeight);

  return (
    <Html
      transform
      position={[position.x, position.y, position.z]}
      scale={htmlScale}
    >
      <div
        style={{
          width: HTML_WIDTH,
          height: HTML_HEIGHT,
          borderRadius: 0,
          background:
            "linear-gradient(145deg, rgba(20,20,30,0.95), rgba(10,10,20,0.98))",
          display: "flex",
          flexDirection: "column",
          padding: "48px 20px 24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif",
          userSelect: "none",
          pointerEvents: "auto",
          overflow: "hidden",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            padding: "0 4px",
          }}
        >
          <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>
            9:41
          </span>
          <span style={{ color: "white", fontSize: 12 }}>●●●</span>
        </div>

        {/* App grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            justifyItems: "center",
          }}
        >
          {apps.map((app) => (
            <button
              key={app.slug}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(app.slug);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${app.color}dd, ${app.color}88)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  boxShadow: `0 4px 12px ${app.color}44`,
                  transition:
                    "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${app.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = `0 4px 12px ${app.color}44`;
                }}
              >
                {app.emoji}
              </div>
              <span
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: 500,
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                {app.name}
              </span>
            </button>
          ))}
        </div>

        {/* Bottom dock area */}
        <div style={{ flex: 1 }} />
        <div
          style={{
            height: 4,
            width: 120,
            background: "rgba(255,255,255,0.3)",
            borderRadius: 2,
            alignSelf: "center",
          }}
        />
      </div>
    </Html>
  );
}
