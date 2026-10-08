"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { App } from "./app-data";

export interface AppOrigin { x: number; y: number; width: number; height: number }

export default function MobileAppView({ app, origin, onClose }: {
  app: App; origin: AppOrigin | null; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      element.close();
    };
  }, []);

  function dismiss() {
    if (closing) return;
    setClosing(true);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(onClose, reduceMotion ? 0 : 260);
  }
  const style = {
    "--app-x": `${origin?.x ?? 0}px`,
    "--app-y": `${origin?.y ?? 0}px`,
    "--app-scale-x": origin ? origin.width / window.innerWidth : 0.15,
    "--app-scale-y": origin ? origin.height / window.innerHeight : 0.15,
  } as CSSProperties;

  return (
    <dialog ref={dialog} className={`mobile-app${closing ? " is-closing" : ""}`}
      aria-labelledby="mobile-project-title" style={style}
      onCancel={event => { event.preventDefault(); dismiss(); }}>
      <header className="mobile-app-toolbar">
        <button autoFocus aria-label="Back to Home" onClick={dismiss}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true"><path d="m10 2-8 8 8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>
        <span>{app.name}</span>
      </header>
      <div className="app-detail-scroll">
        <div className="app-detail-identity">
          {/* Local app artwork is also used by the phone's texture. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.icon} alt="" width="72" height="72" />
          <div><p className="app-detail-eyebrow">PROJECT</p><h2 id="mobile-project-title">{app.name}</h2></div>
        </div>
        <p className="app-detail-summary">{app.description}</p>
        <dl className="app-detail-metadata">
          {app.dates && <div><dt>When</dt><dd>{app.dates}</dd></div>}
          {app.location && <div><dt>Where</dt><dd>{app.location}</dd></div>}
        </dl>
        <section className="app-detail-about" aria-label="About this project">
          <h3>About</h3>
          {app.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
        {app.links.length > 0 && <section className="app-detail-links" aria-label="Project links">
          <h3>Links</h3>
          <div>{app.links.map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>)}</div>
        </section>}
      </div>
      <button className="mobile-app-home" aria-label="Return to Home screen" onClick={dismiss}><span /></button>
    </dialog>
  );
}
