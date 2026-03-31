"use client";

function ArrowIcon({ direction }) {
  const rotation = direction === "down" ? "rotate(180 12 12)" : undefined;

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M6 11l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={rotation}
      />
    </svg>
  );
}

export default function UpDownBtn({
  direction = "up",
  label,
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#dbe1eb]/82 text-[#1f2d4b] shadow-[0_12px_24px_rgba(37,56,88,0.12)] backdrop-blur disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ArrowIcon direction={direction} />
    </button>
  );
}
