"use client";

import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { App } from "./app-data";
import MobileHome from "./MobileHome";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

class ModelBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onUnavailable(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function MobileExperience(props: {
  selectedApp: App | null; onSelectApp: (slug: string) => void; onClose: () => void;
}) {
  const [phase, setPhase] = useState<"entrance" | "zoom" | "home">("entrance");
  const [modelVisible, setModelVisible] = useState(true);
  const zoom = useCallback(() => setPhase(current => current === "entrance" ? "zoom" : current), []);
  const finish = useCallback(() => setPhase("home"), []);
  useEffect(() => {
    if (phase !== "home") return;
    const timeout = setTimeout(() => setModelVisible(false), 450);
    return () => clearTimeout(timeout);
  }, [phase]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frame = requestAnimationFrame(() => { if (preference.matches) finish(); });
    return () => cancelAnimationFrame(frame);
  }, [finish]);
  return (
    <div className={`mobile-experience phase-${phase}`}>
      <div className="mobile-home-layer" inert={phase !== "home"} aria-hidden={phase !== "home"}>
        <MobileHome {...props} />
      </div>
      {modelVisible && <div className="mobile-model-layer" aria-hidden="true">
        <ModelBoundary onUnavailable={finish}>
        <Scene isMobile selectedApp={null} onSelectApp={() => {}} zoomIntoScreen={phase === "zoom"}
          onEntranceComplete={zoom} onZoomComplete={finish} />
        </ModelBoundary>
      </div>}
      {phase !== "home" && <button className="mobile-skip" onClick={finish}>Skip to apps</button>}
    </div>
  );
}
