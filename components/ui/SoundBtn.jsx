"use client";

import { useState } from "react";

export default function SoundBtn() {
  const [muted, setMuted] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setMuted((prev) => !prev)}
      className={`rounded-full p-2 transition-colors cursor-pointer ${
        muted ? "bg-black" : "bg-white"
      }`}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      <img
        src={muted ? "/icons/sound-mute.svg" : "/icons/sound.svg"}
        alt={muted ? "Muted sound icon" : "Sound icon"}
      />
    </button>
  );
}
