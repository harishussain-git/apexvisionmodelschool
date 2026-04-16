"use client";

export default function DemoLoaderOverlay({
  visible,
  progress,
  title,
  label,
  showDebug = true,
}) {
  const percent = progress.totalFrames
    ? Math.round((progress.loadedFrames / progress.totalFrames) * 100)
    : 0;

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[#050816] px-6 text-white transition-opacity duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="w-full max-w-xl">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_120px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.28em] text-white/55">
            Demo Loader
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/65">{label}</p>

          <div className="mt-6 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-white via-sky-300 to-cyan-400 transition-[width] duration-200"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-white/70">
            <span>{progress.loadedFrames} frames ready</span>
            <span>{percent}%</span>
          </div>

          {showDebug ? (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
              <span>Frames</span>
              <span className="text-right text-white">
                {progress.loadedFrames} / {progress.totalFrames}
              </span>
              <span>Failed</span>
              <span className="text-right text-white">{progress.failedFrames}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
