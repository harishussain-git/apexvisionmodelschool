"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.10,
      // wheelMultiplier: 1.2
    });

    window.__lenis = lenis;
    window.lenis = lenis;

    let frameId;

    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      if (window.__lenis === lenis) {
        window.__lenis = null;
      }
      if (window.lenis === lenis) {
        window.lenis = null;
      }
      lenis.destroy();
    };
  }, []);

  return null;
}
