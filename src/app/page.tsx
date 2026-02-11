"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Home() {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focused) {
        setFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

  const handleSelectApp = (slug: string) => {
    console.log(`Navigate to: /app/${slug}`);
    // TODO: router.push(`/app/${slug}`) when routes are ready
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-white/50">
            Loading...
          </div>
        }
      >
        <Scene
          focused={focused}
          onOpen={() => setFocused(true)}
          onSelectApp={handleSelectApp}
        />
      </Suspense>

      {/* Back button when focused */}
      {focused && (
        <button
          onClick={() => setFocused(false)}
          className="absolute top-6 left-6 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          ← Back
        </button>
      )}

      {/* Hint text when idle */}
      {!focused && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-white/40 animate-pulse">
            Click the phone to explore
          </p>
        </div>
      )}
    </div>
  );
}
