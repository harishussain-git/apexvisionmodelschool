"use client";

import { useEffect, useMemo, useState } from "react";
import banners from "@/data/home/home-banner.json";

export default function UpcomingEventCard({ showIn = "#hero" }) {
  const items = banners?.news ?? [];
  const [isInSection, setIsInSection] = useState(false);

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

    const updateSectionVisibility = () => {
      const viewportHeight = window.innerHeight;
      const active = targets.some((target) => {
        const rect = target.getBoundingClientRect();
        return rect.top < viewportHeight && rect.bottom > 0;
      });
      setIsInSection(active);
    };

    requestAnimationFrame(updateSectionVisibility);
    window.addEventListener("scroll", updateSectionVisibility, { passive: true });
    window.addEventListener("resize", updateSectionVisibility);

    return () => {
      window.removeEventListener("scroll", updateSectionVisibility);
      window.removeEventListener("resize", updateSectionVisibility);
    };
  }, [alwaysVisible, selectors]);

  if (!items.length) return null;

  const current = items[0];
  const shouldShow = alwaysVisible || isInSection;

  return (
    <article
      className={`w-full max-w-10 rounded-2xl bg-white/50 p-2 shadow-lg backdrop-blur-2xl md:max-w-80 ${
        shouldShow ? "block" : "hidden"
      }`}
    >
      <div className="flex h-24 items-center gap-3">
        
          <img
          src={current.image}
          alt={current.title}
          className="saturate-0 w-14 h-full rounded-lg object-cover"
        />
        
        <div className="flex flex-col gap-3">
          <p className="text-sm">Upcoming Events</p>
          <p className="font-bricolage-grotesque text-sm leading-5 text-black">
            {current.title}
          </p>
        </div>
      </div>
    </article>
  );
}
