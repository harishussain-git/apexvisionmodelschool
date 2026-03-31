"use client";

import Image from "next/image";

export default function SequenceLoaderOverlay({
  loadedCount = 0,
  totalCount = 1,
  isReady = false,
}) {
  const safeTotal = Math.max(totalCount, 1);
  const progress = Math.round((loadedCount / safeTotal) * 100);
  const logoWidth = "min(72vw, 680px)";

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-white text-black transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isReady ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="relative" style={{ width: logoWidth }}>
          <Image
            src="/icons/apex-logo.svg"
            alt="Apex Vision Model School"
            width={680}
            height={220}
            priority
            className="block h-auto w-full opacity-[0.12] grayscale"
          />
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <Image
              src="/icons/apex-logo.svg"
              alt=""
              aria-hidden="true"
              width={680}
              height={220}
              className="block h-auto max-w-none"
              style={{ width: logoWidth }}
            />
          </div>
        </div>
        <div className="absolute bottom-10 flex items-center gap-3 font-accent text-3xl uppercase tracking-[0.18em] text-black/78 sm:bottom-12">
          <span>Loading.</span>
          <span className="text-black/52">{String(progress).padStart(2, "0")}%</span>
        </div>
      </div>
    </div>
  );
}
