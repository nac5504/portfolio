"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { apps } from "@/components/Phone";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

// Platform icon mapping
const platformIcons: Record<string, string> = {
  github: "/icons/github.png",
  appstore: "/icons/appstore.png",
};

export default function Home() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState(false);

  const handleSelectApp = (slug: string) => {
    setSelectedApp(slug);
  };

  const handleBack = () => {
    setSelectedApp(null);
  };

  const activeApp = apps.find((a) => a.slug === selectedApp);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Intro sequence */}
      {!introDone && (
        <div
          className="intro-overlay"
          onAnimationEnd={(e) => {
            if (e.animationName === "intro-fade-out") setIntroDone(true);
          }}
        >
          <span className="intro-name">Nick Candello</span>
          <span className="intro-role-1">Georgia Tech Student</span>
          <span className="intro-role-2">App Developer</span>
          <span className="intro-role-3">Electrical Engineer</span>
        </div>
      )}

      {/* Dynamic animated gradient background */}
      <div className="dynamic-bg" />

      {/* Main content — only after intro finishes */}
      {introDone && (
        <div className="main-content" style={{ position: "absolute", inset: 0 }}>
          {/* Name */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 48,
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <h1
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#EBEBD3",
                margin: 0,
                opacity: 0.9,
              }}
            >
              Nick Candello
            </h1>
          </div>

          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center text-white/50">
                Loading...
              </div>
            }
          >
            <Scene onSelectApp={handleSelectApp} selectedApp={selectedApp} />
          </Suspense>

          {/* Floating project detail module — liquid glass */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "4%",
              transform: `translateY(-50%) translateX(${activeApp ? "0" : "120%"}) scale(${activeApp ? 1 : 0.95})`,
              opacity: activeApp ? 1 : 0,
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
              width: "50vw",
              height: "88vh",
              pointerEvents: activeApp ? "auto" : "none",
              zIndex: 20,
              borderRadius: 32,
              overflow: "hidden",
            }}
          >
            {/* Glass background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(165deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 35%, rgba(101,48,118,0.08) 100%)",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 32,
                boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            />

            {/* Top refraction highlight */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 180,
                background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)",
                borderRadius: "32px 32px 0 0",
                pointerEvents: "none",
              }}
            />

            {/* Scrollable content */}
            {activeApp && (
              <div
                className="detail-scroll"
                style={{
                  position: "relative",
                  height: "100%",
                  overflowY: "auto",
                  padding: "44px 48px 40px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                }}
              >
                {/* Title card — icon left, title + description right */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 22,
                      overflow: "hidden",
                      flexShrink: 0,
                      boxShadow: `0 8px 28px ${activeApp.colorEnd}40, 0 2px 8px rgba(0,0,0,0.25)`,
                      background: activeApp.icon ? "none" : `linear-gradient(145deg, ${activeApp.color}, ${activeApp.colorEnd})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 42,
                    }}
                  >
                    {activeApp.icon ? (
                      <img src={activeApp.icon} alt={activeApp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      activeApp.emoji
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: 40,
                        fontWeight: 800,
                        letterSpacing: "-0.035em",
                        margin: 0,
                        color: "#EBEBD3",
                        lineHeight: 1.05,
                      }}
                    >
                      {activeApp.name}
                    </h2>
                    <p
                      style={{
                        fontSize: 16,
                        lineHeight: 1.5,
                        margin: "8px 0 0",
                        color: "rgba(235,235,211,0.5)",
                        fontWeight: 500,
                      }}
                    >
                      {activeApp.description}
                    </p>
                  </div>
                </div>

                {/* Dates & Location — resume style */}
                {(activeApp.dates || activeApp.location) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 14,
                      color: "rgba(235,235,211,0.35)",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      marginBottom: 4,
                    }}
                  >
                    {activeApp.dates && <span>{activeApp.dates}</span>}
                    {activeApp.location && <span>{activeApp.location}</span>}
                  </div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(101,48,118,0.12), transparent)", margin: "24px 0" }} />

                {/* Freeform content */}
                {activeApp.content.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    {activeApp.content.map((paragraph, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: 15,
                          lineHeight: 1.8,
                          margin: "0 0 16px",
                          color: "rgba(235,235,211,0.6)",
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Links */}
                {activeApp.links.length > 0 && (
                  <div>
                    <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(101,48,118,0.12), transparent)", marginBottom: 22 }} />
                    <h3
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(235,235,211,0.3)",
                        margin: "0 0 14px",
                      }}
                    >
                      Links
                    </h3>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {activeApp.links.map((link: any, i) => {
                        const iconSrc = link.platform && link.platform !== "website" ? platformIcons[link.platform] : null;
                        const isWebsite = link.platform === "website";
                        return (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 18px",
                              borderRadius: 980,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "#EBEBD3",
                              fontSize: 14,
                              fontWeight: 500,
                              textDecoration: "none",
                              letterSpacing: "0.02em",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                            }}
                          >
                            {iconSrc && (
                              <img
                                src={iconSrc}
                                alt={link.platform}
                                style={{
                                  width: 18,
                                  height: 18,
                                  objectFit: "contain",
                                }}
                              />
                            )}
                            {isWebsite && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                                <defs>
                                  <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#B57CC8" />
                                    <stop offset="100%" stopColor="#653076" />
                                  </linearGradient>
                                </defs>
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke={`url(#gradient-${i})`}
                                  strokeWidth="2"
                                />
                                <path
                                  d="M2 12h20"
                                  stroke={`url(#gradient-${i})`}
                                  strokeWidth="2"
                                />
                                <path
                                  d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                                  stroke={`url(#gradient-${i})`}
                                  strokeWidth="2"
                                />
                                <ellipse
                                  cx="12"
                                  cy="12"
                                  rx="4"
                                  ry="10"
                                  stroke={`url(#gradient-${i})`}
                                  strokeWidth="2"
                                />
                                <path
                                  d="M12 2v20"
                                  stroke={`url(#gradient-${i})`}
                                  strokeWidth="2"
                                />
                              </svg>
                            )}
                            {link.label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating back chevron — liquid glass circle */}
          <button
            onClick={handleBack}
            style={{
              position: "absolute",
              left: 32,
              top: "50%",
              transform: `translateY(-50%) scale(${activeApp ? 1 : 0.6})`,
              opacity: activeApp ? 1 : 0,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: activeApp ? "auto" : "none",
              zIndex: 30,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 100%)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#EBEBD3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
