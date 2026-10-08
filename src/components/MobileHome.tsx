"use client";

import { useRef, useState } from "react";
import { apps, type App } from "./app-data";
import { socials } from "./phone-display";
import MobileAppView, { type AppOrigin } from "./MobileAppView";

export default function MobileHome({ selectedApp, onSelectApp, onClose }: {
  selectedApp: App | null; onSelectApp: (slug: string) => void; onClose: () => void;
}) {
  const [origin, setOrigin] = useState<AppOrigin | null>(null);
  const lastIcon = useRef<HTMLButtonElement | null>(null);
  function close() {
    onClose();
    requestAnimationFrame(() => lastIcon.current?.focus({ preventScroll: true }));
  }
  return (
    <div className="mobile-phone">
      <div className={`mobile-home${selectedApp ? " app-is-open" : ""}`}>
        <div className="mobile-status" aria-hidden="true">
          <span>9:41</span>
          <span className="mobile-island" />
          <span className="mobile-status-signals">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect y="8" width="3" height="4" rx="1" /><rect x="4.5" y="6" width="3" height="6" rx="1" /><rect x="9" y="3" width="3" height="9" rx="1" /><rect x="13.5" width="3" height="12" rx="1" /></svg>
            <svg width="17" height="13" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M2 4a12 12 0 0 1 16 0M5 8a7 7 0 0 1 10 0M8 12a3 3 0 0 1 4 0" /></svg>
            <span className="mobile-battery" />
          </span>
        </div>
        <main className="mobile-home-main">
          <h1 className="sr-only">Nick Candello’s apps</h1>
          <nav className="mobile-app-grid" aria-label="My apps">
            {apps.map(app => <button key={app.slug} aria-label={`Open ${app.name}`} onClick={event => {
              const rect = event.currentTarget.querySelector("img")!.getBoundingClientRect();
              setOrigin({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
              lastIcon.current = event.currentTarget;
              onSelectApp(app.slug);
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.icon} alt="" width="64" height="64" draggable={false} />
              <span>{app.name}</span>
            </button>)}
          </nav>
        </main>
        <footer className="mobile-home-footer">
          <div className="mobile-page-dots" aria-hidden="true"><i /><i /></div>
          <nav className="mobile-dock" aria-label="Social links">
            {socials.map(social => <a key={social.name} href={social.href} aria-label={social.name} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={social.icon} alt="" width="64" height="64" draggable={false} />
            </a>)}
          </nav>
          <div className="mobile-home-indicator" aria-hidden="true" />
        </footer>
      </div>
      {selectedApp && <MobileAppView key={selectedApp.slug} app={selectedApp} origin={origin} onClose={close} />}
    </div>
  );
}
