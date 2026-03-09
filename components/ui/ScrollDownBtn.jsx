"use client";

import { useEffect, useMemo, useState } from "react";

const ScrollDownBtn = ({ showIn = "#hero" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectors = useMemo(
    () =>
      showIn
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [showIn]
  );

  const alwaysVisible = selectors.length === 0;

  useEffect(() => {
    if (alwaysVisible) return;

    const targets = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean);

    const updateVisibility = () => {
      const viewportHeight = window.innerHeight;
      const active = targets.some((target) => {
        const rect = target.getBoundingClientRect();
        return rect.top >= 0 && rect.top < viewportHeight;
      });
      setIsVisible(active);
    };

    requestAnimationFrame(updateVisibility);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [alwaysVisible, selectors]);

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "auto" });
  };

  const shouldShow = alwaysVisible || isVisible;

  return (
    <button
      type="button"
      onClick={handleScrollDown}
      className={`fixed bottom-6 right-6 z-50 cursor-pointer items-center gap-2 rounded-full bg-white/20 p-1.5 backdrop-blur-3xl md:flex ${
        shouldShow ? "flex" : "hidden"
      }`}
      aria-label="Scroll down"
    >
      <span className="font-clash-display bg-white px-6 py-2 font-medium rounded-full">
        Scroll
      </span>
      <span className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
        <img className="w-4 rotate-180" src="/icons/down.svg" alt="up" />
      </span>
      <span className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
        <img className="w-4" src="/icons/down.svg" alt="down" />
      </span>
    </button>
  );
};

export default ScrollDownBtn;
