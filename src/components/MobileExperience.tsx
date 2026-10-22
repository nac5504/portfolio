"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
  const container = useRef<HTMLDivElement>(null);
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
  // Preserve the first genuine page swipe, then stop reverse gestures from
  // scrolling the document back to its top. Leave dialogs and pinch zoom alone.
  useEffect(() => {
    const element = container.current;
    if (!element || phase !== "home" || props.selectedApp ||
        window.matchMedia("(display-mode: standalone)").matches) return;
    let previousY: number | null = null;
    let hasScrolled = window.scrollY > 8;
    const trackScroll = () => { hasScrolled ||= window.scrollY > 8; };
    const canScrollUp = (target: EventTarget | null) => {
      const scroller = target instanceof Element ? target.closest(".mobile-home-main") : null;
      return scroller !== null && scroller.scrollTop > 0;
    };
    const start = (event: TouchEvent) => {
      previousY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) { previousY = null; return; }
      const y = event.touches[0].clientY;
      if (previousY !== null && y > previousY && hasScrolled &&
          !canScrollUp(event.target) && event.cancelable) event.preventDefault();
      previousY = y;
    };
    const end = () => { previousY = null; };
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && event.deltaY < 0 && hasScrolled &&
          !canScrollUp(event.target) && event.cancelable) event.preventDefault();
    };
    window.addEventListener("scroll", trackScroll, { passive: true });
    element.addEventListener("touchstart", start, { passive: true });
    element.addEventListener("touchmove", move, { passive: false });
    element.addEventListener("touchend", end, { passive: true });
    element.addEventListener("touchcancel", end, { passive: true });
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      window.removeEventListener("scroll", trackScroll);
      element.removeEventListener("touchstart", start);
      element.removeEventListener("touchmove", move);
      element.removeEventListener("touchend", end);
      element.removeEventListener("touchcancel", end);
      element.removeEventListener("wheel", wheel);
    };
  }, [phase, props.selectedApp]);
  return (
    <div ref={container} className={`mobile-experience phase-${phase}`}>
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
