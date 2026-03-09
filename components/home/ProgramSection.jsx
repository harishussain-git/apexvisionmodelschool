"use client";

import { useEffect, useRef } from "react";
import programs from "@/data/home/programs.json";

export default function ProgramSection({ program }) {
  const data = programs?.[program];
  const sectionRef = useRef(null);
  const cardsRailRef = useRef(null);

  // Dynamic section text from JSON with safe fallbacks.
  const sectionName =
    data?.["section-name"] ||
    data?.sectionName ||
    data?.section_name ||
    data?.title ||
    "Program Section";
  const sectionTitle =
    data?.["section-heading"] ||
    data?.sectionHeading ||
    data?.section_heading ||
    data?.sectionTitle ||
    data?.section_title ||
    data?.popup?.title ||
    "Program Highlights";
  const sectionSubtitle =
    data?.["section-subtitle"] ||
    data?.sectionSubtitle ||
    data?.section_subtitle ||
    data?.caption ||
    data?.subtitle ||
    "";
  const sectionFactMetric =
    data?.sectionFactMetric ||
    data?.section_fact_metric ||
    data?.["metric-count"] ||
    data?.fact?.metric ||
    "";
  const sectionFactMetricText =
    data?.sectionFactMetricText ||
    data?.section_fact_metric_text ||
    data?.["metric-count-text"] ||
    data?.fact?.text ||
    "";
  const sectionBgImage =
    data?.["section-bg-image"] ||
    data?.sectionBgImage ||
    "/homepage/clay/classroom-clay.webp";
  const features = data?.popup?.features || [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const expandBtn = section.querySelector("#program-popup-button");
    const closeBtn = section.querySelector("#program-popup-close-btn");
    const compactPanel = section.querySelector("#program-info-panel-compact");
    const expandedPanel = section.querySelector("#program-popup-expanded-container");

    if (!expandBtn || !closeBtn || !compactPanel || !expandedPanel) return;

    let lockedScrollY = 0;

    const lockPageScroll = () => {
      lockedScrollY = window.scrollY;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    };

    const unlockPageScroll = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, lockedScrollY);
    };

    const openPopup = (event) => {
      event.preventDefault();
      compactPanel.classList.add("hidden");
      expandedPanel.classList.remove("hidden");
      lockPageScroll();
    };

    const closePopup = (event) => {
      event.preventDefault();
      expandedPanel.classList.add("hidden");
      compactPanel.classList.remove("hidden");
      unlockPageScroll();
    };

    expandBtn.addEventListener("click", openPopup);
    closeBtn.addEventListener("click", closePopup);

    return () => {
      expandBtn.removeEventListener("click", openPopup);
      closeBtn.removeEventListener("click", closePopup);
      unlockPageScroll();
    };
  }, []);

  const scrollCards = (direction) => {
    const rail = cardsRailRef.current;
    if (!rail) return;
    const amount = Math.max(rail.clientWidth * 0.7, 260);
    rail.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!data) return null;

  return (
    <section
      ref={sectionRef}
      className="h-screen w-full bg-cover bg-center relative flex items-center justify-center "
      style={{ backgroundImage: `url(${sectionBgImage})` }}
    >
      
      {/* Compact panel (kept with same classes/behavior you set) */}
      <div id="program-info-panel-compact" className="bg-white/30 rounded-2xl backdrop-blur-3xl w-full max-w-[90vw] p-2 border border-white/80 absolute md:max-w-[55ch] bottom-4 md:left-10 md:top-14 h-fit">
        <a className="flex items-center justify-between pt-1 pb-2 px-2" href="#program-popup-button">
          <p className="text-caption uppercase">{sectionName}</p>
          <button id="program-popup-button" className="h-8 w-8 flex justify-center items-center bg-white rounded-full">
            <img className="w-7" src="/icons/popup-arrow.svg" alt="expand button" />
          </button>
        </a>

        {/* Static template intentionally kept in comment:
            section-name / section-title / section-subtitle / section-fact-metric / section-fact-metric-text */}
        <div className="bg-white p-4 md:p-6 flex flex-col items-start gap-2 md:gap-5 rounded-xl">
          <p className="text-heading uppercase">{sectionTitle}</p>
          <div className="hidden md:block w-full h-[2px] bg-black/5"></div>
          <div className="flex-col gap-2 hidden md:flex">
            <p className="text-body">{sectionSubtitle}</p>
            <div className="gap-1 items-center flex">
              <p className="text-body-lg font-semibold">{sectionFactMetric}</p>
              <p>{sectionFactMetricText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded popup */}
      <div className="flex h-full w-full bg-black/70 z-1000 fixed top-0 left-0 justify-center items-center hidden" id="program-popup-expanded-container">
        <div className="bg-white/30 rounded-2xl backdrop-blur-3xl p-2 border border-white/80 w-full md:max-w-[clamp(22rem,70vw,72rem)] top-0 md:top-14 h-fit" id="program-popup-expanded">
          <div className="flex items-center justify-between pt-2 pb-3 px-2">
            <p className="text-caption uppercase">{sectionName}</p>
            <button id="program-popup-close-btn" className="flex items-center h-8 w-8 justify-center bg-white rounded-full cursor-pointer" aria-label="Close popup">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="bg-white p-4 md:p-6 flex flex-col items-start gap-2 md:gap-5 rounded-xl overflow-auto max-h-[80vh] md:h-auto">
            <p className="text-heading uppercase">{sectionTitle}</p>
            <div className="w-full h-[2px] bg-black/5"></div>

            <div className="flex justify-between w-full items-center">
              <div className="flex-col gap-2 pb-4">
                <p className="text-body">{sectionSubtitle}</p>
                <div className="gap-1 items-center flex">
                  <p className="text-body-lg font-semibold">{sectionFactMetric}</p>
                  <p>{sectionFactMetricText}</p>
                </div>
              </div>

              <div className="hidden md:flex gap-2">
                <button
                  type="button"
                  onClick={() => scrollCards(-1)}
                  className="h-9 w-9 flex items-center justify-center bg-white rounded-full border border-black/10"
                  aria-label="Scroll left"
                >
                  <img className="w-4 rotate-90" src="/icons/down.svg" alt="left arrow" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCards(1)}
                  className="h-9 w-9 flex items-center justify-center bg-white rounded-full border border-black/10"
                  aria-label="Scroll right"
                >
                  <img className="w-4 -rotate-90" src="/icons/down.svg" alt="right arrow" />
                </button>
              </div>
            </div>

            {/* Mobile: vertical cards. Desktop: horizontal scrollable cards */}
            <div ref={cardsRailRef} className="flex flex-col md:flex-row gap-4 w-full overflow-y-auto md:overflow-y-hidden md:overflow-x-auto">
              {features.map((feature, idx) => {
                const featureTitle = feature?.sectionNameTitle || feature?.section_name_title || feature?.name || `Feature ${idx + 1}`;
                const featureDesc = feature?.sectionNameDesc || feature?.section_name_desc || feature?.description || "";
                const featureImg = feature?.sectionNameImg || feature?.section_name_img || feature?.image || "/homepage/popup/classroom-clay.webp";

                return (
                  <div key={`${featureTitle}-${idx}`} className="flex flex-col gap-2 rounded-2xl border border-gray-300 p-2 md:min-w-70 h-fit">
                    <img className="rounded-xl max-h-30 object-cover" src={featureImg} alt={featureTitle} />
                    <p className="text-caption uppercase">{featureTitle}</p>
                    <p>{featureDesc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
