"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated, to } from "@react-spring/three";
import * as THREE from "three";

// Helper to handle basePath for GitHub Pages deployment
const getAssetPath = (path: string) => {
  const basePath = '/portfolio';
  return `${basePath}${path}`;
};

const MODEL_PATH = getAssetPath("/models/iphone-17-pro.glb");

export const apps = [
  {
    name: "Cravr", slug: "cravr", color: "#FF6B6B", colorEnd: "#E84545", emoji: "\u{1F9E0}", icon: getAssetPath("/icons/cravr.png"),
    description: "An AI-powered app that analyzes your cravings and suggests healthier alternatives based on what your body actually needs.",
    dates: "Jan 2025 — Present", location: "San Francisco, CA",
    content: [
      "Led full-stack development of a mobile application built with React Native and a Node.js backend. Integrated OpenAI's API to power a personalized recommendation engine that maps cravings to nutritional deficiencies.",
      "Designed the end-to-end user experience from onboarding to daily craving logs, iterating on prototypes with a small beta group of 50 users. Achieved a 4.8-star average rating during TestFlight beta.",
      "Built a custom data pipeline for nutritional analysis using USDA FoodData Central, enabling real-time lookup and scoring of over 300,000 food items.",
    ],
    links: [{ label: "App Store", url: "#", platform: "appstore" }, { label: "GitHub", url: "#", platform: "github" }],
  },
  {
    name: "Nomad", slug: "nomad", color: "#5CE0D5", colorEnd: "#36B5A0", emoji: "\u{1F5FA}\uFE0F", icon: getAssetPath("/icons/nomad.png"),
    description: "A travel companion app that curates personalized itineraries, discovers hidden local gems, and connects you with fellow travelers.",
    dates: "Aug 2024 — Dec 2024", location: "Remote",
    content: [
      "Architected a cross-platform mobile app with React Native featuring real-time itinerary collaboration, offline map caching, and push notifications for trip updates.",
      "Developed a location-aware recommendation system using PostGIS geospatial queries and collaborative filtering to surface hidden gems tailored to each traveler's interests.",
      "Implemented social features including trip sharing, traveler matching by destination, and a community-driven point-of-interest database with user reviews and photos.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Demo Video", url: "#", platform: "website" }],
  },
  {
    name: "FlavorFeed", slug: "flavorfeed", color: "#FFE066", colorEnd: "#FFBC42", emoji: "\u{1F355}", icon: getAssetPath("/icons/flavorfeed.png"),
    description: "A social food discovery platform where users share, rate, and find the best dishes near them through a swipeable feed.",
    dates: "Mar 2024 — Jul 2024", location: "San Francisco, CA",
    content: [
      "Built a social food discovery platform from the ground up using React Native with a Tinder-style swipeable feed for browsing dishes posted by nearby users and restaurants.",
      "Engineered a geolocation-based feed algorithm that ranks dishes by proximity, aggregate ratings, and learned taste preferences using a lightweight ML model trained on user interactions.",
      "Designed and implemented photo upload with automatic dish recognition, restaurant tagging via Google Places API, and real-time review updates powered by WebSockets.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "YouTube", url: "#", platform: "website" }],
  },
  {
    name: "Guess-E", slug: "guess-e", color: "#7EE8B4", colorEnd: "#4CC98A", emoji: "\u{1F3A8}", icon: getAssetPath("/icons/guesse.png"),
    description: "A creative guessing game powered by AI-generated art. Players sketch prompts and others guess what was drawn.",
    dates: "Nov 2023 — Feb 2024", location: "Hackathon Project",
    content: [
      "Created a multiplayer drawing and guessing game that leverages DALL-E to generate creative visual prompts and evaluates player sketches for similarity using CLIP embeddings.",
      "Implemented real-time game state synchronization using Socket.IO, supporting up to 8 concurrent players per room with sub-100ms latency on average.",
      "Won 2nd place at HackSF 2023. The project was built in 36 hours by a team of three, with my focus on the real-time backend and AI integration.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Devpost", url: "#", platform: "website" }],
  },
  {
    name: "mal", slug: "mal", color: "#D8A4E8", colorEnd: "#B57CC8", emoji: "\u{1F4DA}", icon: getAssetPath("/icons/mal.png"),
    description: "A media tracking app for anime, manga, books, and more. Log what you've watched, rate it, and get personalized recommendations.",
    dates: "Jun 2023 — Oct 2023", location: "Personal Project",
    content: [
      "Developed a comprehensive media tracking application supporting anime, manga, books, and podcasts with detailed logging, rating, and review features.",
      "Integrated with MyAnimeList, Open Library, and Spotify APIs to auto-populate metadata, cover art, and synopses — reducing manual entry for users by over 90%.",
      "Built a recommendation engine using collaborative filtering on aggregated user ratings, surfacing personalized suggestions with an explanation of why each item was recommended.",
    ],
    links: [{ label: "GitHub", url: "#", platform: "github" }, { label: "Live App", url: "#", platform: "website" }],
  },
  {
    name: "Letter Day", slug: "letterday", color: "#82D4F2", colorEnd: "#5BA8D4", emoji: "\u{1F4C5}", icon: getAssetPath("/icons/letterday.png"),
    description: "A mindful journaling app that delivers a daily letter prompt, encouraging reflection and building a habit of expressive writing.",
    dates: "Feb 2023 — May 2023", location: "Personal Project",
    content: [
      "Designed and built a journaling app focused on daily reflection through curated writing prompts, featuring a calming minimalist interface with smooth animations and haptic feedback.",
      "Implemented a streak and habit tracking system with local push notifications, achieving a 60% day-7 retention rate among beta testers.",
      "Created a private journal archive with full-text search, mood tagging, and a monthly reflection summary generated using GPT-4, helping users track personal growth over time.",
    ],
    links: [{ label: "App Store", url: "#", platform: "appstore" }, { label: "GitHub", url: "#", platform: "github" }],
  },
];

interface PhoneProps {
  onSelectApp: (slug: string) => void;
  selectedApp: string | null;
}

export default function Phone({ onSelectApp, selectedApp }: PhoneProps) {
  const { scene } = useGLTF(MODEL_PATH);

  // Entrance animation - phone shoots up from below with spin
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Delay to allow model and screen to render properly before animating
    const timer = setTimeout(() => setHasEntered(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const entranceSpring = useSpring({
    position: hasEntered ? [0, 0, 0] : [0, -2.5, 0],
    rotation: hasEntered ? [0, 0, 0] : [0, Math.PI * 5, 0], // 2.5 full rotations (900°)
    config: {
      mass: 1.8,
      tension: 140,
      friction: 32,
      clamp: false // Allow overshoot
    },
  });

  const spring = useSpring({
    positionX: selectedApp ? -0.09 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Find Display mesh: make it black, compute its local-space bounds
  const display = useMemo(() => {
    let center = new THREE.Vector3(0, 0, 0.004);
    let width = 0.06754;
    let height = 0.14566;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && (mesh.material as THREE.Material).name === "Display") {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.set("#000000");
          mat.emissive.set("#000000");
          mat.transparent = false;
          mat.opacity = 1;

          // Compute bounding box in local space
          mesh.geometry.computeBoundingBox();
          const box = mesh.geometry.boundingBox!;

          // Get center in local space and transform to world space
          const localCenter = new THREE.Vector3();
          box.getCenter(localCenter);
          const worldCenter = localCenter.clone();
          mesh.localToWorld(worldCenter);

          center = worldCenter;
          center.z += 0.0006; // Slight offset to sit on top of display

          // Get dimensions (use local space, they're not affected by translation)
          width = Math.abs(box.max.x - box.min.x);
          height = Math.abs(box.max.y - box.min.y);
        }
      }
    });

    return { center, width, height };
  }, [scene]);

  // Hide when camera is behind the phone
  const screenRef = useRef<HTMLDivElement>(null);
  useFrame(({ camera }) => {
    if (!screenRef.current) return;
    const isFront = camera.position.z > 0;
    screenRef.current.style.opacity = isFront ? "1" : "0";
    screenRef.current.style.pointerEvents = isFront ? "auto" : "none";
  });

  const HTML_WIDTH = 300;
  const distanceFactor = (display.width * 400) / HTML_WIDTH;
  const htmlHeight = Math.round(display.height * 400 / distanceFactor);

  // Position at the center of the display
  const htmlPos: [number, number, number] = [
    display.center.x,
    display.center.y,
    display.center.z,
  ];

  // Properly combine both animated values with reactive binding
  const combinedPosition = to(
    [spring.positionX, entranceSpring.position],
    (xPos, pos: any) => [xPos, pos[1], pos[2]]
  );

  return (
    <animated.group
      position={combinedPosition as any}
      rotation={entranceSpring.rotation as any}
    >
      <primitive object={scene} />

      {/* Home screen overlay — centered on display */}
      <Html
        transform
        center
        position={htmlPos}
        distanceFactor={distanceFactor}
        pointerEvents="auto"
      >
        <div
          ref={screenRef}
          style={{
            width: HTML_WIDTH,
            height: htmlHeight,
            backgroundImage: `url('${getAssetPath("/icons/phoneBackground.jpg")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 44,
            display: "flex",
            flexDirection: "column",
            padding: "14px 14px 20px",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif",
            userSelect: "none",
            overflow: "hidden",
          }}
        >
          {/* Status bar with Dynamic Island inline */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 6px",
              marginBottom: 28,
            }}
          >
            {/* Time */}
            <span style={{ color: "white", fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", textShadow: "0 1px 3px rgba(0,0,0,0.4)", flex: "1" }}>
              9:41
            </span>

            {/* Dynamic Island */}
            <div
              style={{
                width: 120,
                height: 34,
                background: "#000",
                borderRadius: 20,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
                flexShrink: 0,
              }}
            />

            {/* Battery & signal */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1", justifyContent: "flex-end" }}>
              <svg width="16" height="11" viewBox="0 0 18 12" fill="white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
                <rect x="0" y="9" width="3" height="3" rx="0.5" />
                <rect x="5" y="6" width="3" height="6" rx="0.5" />
                <rect x="10" y="3" width="3" height="9" rx="0.5" />
                <rect x="15" y="0" width="3" height="12" rx="0.5" />
              </svg>
              <svg width="15" height="11" viewBox="0 0 16 12" fill="white" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
                <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM4.05 7.46a5.6 5.6 0 017.9 0l-.94.94a4.28 4.28 0 00-6.02 0l-.94-.94zM1.39 4.81a9.14 9.14 0 0113.22 0l-.94.94a7.82 7.82 0 00-11.34 0l-.94-.94z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 1, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
                <div style={{ width: 22, height: 11, borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.9)", padding: 1.5 }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 1.5, background: "white" }} />
                </div>
                <div style={{ width: 2, height: 4, borderRadius: "0 1px 1px 0", background: "rgba(255,255,255,0.5)" }} />
              </div>
            </div>
          </div>

          {/* App grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              justifyItems: "center",
              padding: "0 4px",
            }}
          >
            {apps.map((app) => (
              <button
                key={app.slug}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectApp(app.slug);
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
                    borderRadius: 15,
                    overflow: "hidden",
                    transition: "transform 0.15s ease",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {app.icon ? (
                    <img src={app.icon} alt={app.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(160deg, ${app.color}, ${app.colorEnd})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 30,
                      }}
                    >
                      {app.emoji}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    color: "white",
                    fontSize: 11,
                    fontWeight: 500,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {app.name}
                </span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Social dock */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 4,
              padding: "10px 24px",
              background: "rgba(101, 48, 118, 0.12)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              borderRadius: 22,
              border: "1px solid rgba(101, 48, 118, 0.2)",
            }}
          >
            {[
              { name: "LinkedIn", href: "https://www.linkedin.com/in/nicholas-candello-426392157/", icon: getAssetPath("/icons/linkedin.png") },
              { name: "X", href: "https://x.com/nick_candello", icon: getAssetPath("/icons/x.png") },
              { name: "Instagram", href: "https://www.instagram.com/nick_candello", icon: getAssetPath("/icons/instagram.png") },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 15,
                    overflow: "hidden",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <img src={social.icon} alt={social.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </a>
            ))}
          </div>

          {/* Home indicator — glass bar */}
          <div
            style={{
              height: 5,
              width: 134,
              background: "rgba(255, 255, 255, 0.45)",
              borderRadius: 3,
              alignSelf: "center",
              marginTop: 4,
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.15)",
            }}
          />
        </div>
      </Html>
    </animated.group>
  );
}

useGLTF.preload(MODEL_PATH);
