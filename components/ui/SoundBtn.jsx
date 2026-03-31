"use client";

import { useState } from "react";

function SoundGlyph({ muted = false }) {
  const lineClassName = muted ? "opacity-0" : "opacity-100";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10.5h2.8l3.7-3.5v10l-3.7-3.5H5z" />
      <path className={lineClassName} d="M15 9.25a4 4 0 0 1 0 5.5" />
      <path className={lineClassName} d="M17.5 7a7 7 0 0 1 0 10" />
      {muted ? <path d="M15.25 8.75 19 12.5m0-3.75-3.75 3.75" /> : null}
    </svg>
  );
}

export default function SoundBtn() {
  const [muted, setMuted] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setMuted((prev) => !prev)}
      className={`fixed bottom-5 left-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur transition-colors sm:bottom-6 sm:left-6 ${
        muted ? "bg-black text-white" : "bg-white/92 text-neutral-900"
      }`}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={muted}
    >
      <SoundGlyph muted={muted} />
    </button>
  );
}
