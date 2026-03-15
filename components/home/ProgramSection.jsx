"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import programs from "@/data/home/programs.json"

function mergeProgramData(baseData = {}, content = {}) {
  const fallbackFeatures = baseData?.popup?.features ?? []
  const contentFeatures = content?.popup?.features ?? content?.features

  return {
    ...baseData,
    ...content,
    popup: {
      ...baseData?.popup,
      ...content?.popup,
      features: contentFeatures ?? fallbackFeatures,
    },
  }
}

function mapItemsToFeatures(items = []) {
  return items.map((item) => {
    if (typeof item === "string") {
      return {
        name: item,
        description: "",
        image: "/homepage/popup/image-placeholder.png",
      }
    }

    return {
      name: item?.title ?? item?.name ?? "Feature",
      description: item?.text ?? item?.description ?? "",
      image: item?.image ?? item?.src ?? "/homepage/popup/image-placeholder.png",
    }
  })
}

export default function ProgramSection({ program, overlay = false, content = {} }) {
  const cardsRailRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const data = useMemo(() => {
    const baseData = program ? programs?.[program] : null
    return mergeProgramData(baseData ?? {}, content)
  }, [content, program])

  const sectionName =
    data?.["section-name"] ||
    data?.sectionName ||
    data?.section_name ||
    data?.eyebrow ||
    data?.title ||
    "Program Section"

  const sectionTitle =
    data?.["section-heading"] ||
    data?.sectionHeading ||
    data?.section_heading ||
    data?.sectionTitle ||
    data?.section_title ||
    data?.title ||
    data?.popup?.title ||
    "Program Highlights"

  const sectionSubtitle =
    data?.["section-subtitle"] ||
    data?.sectionSubtitle ||
    data?.section_subtitle ||
    data?.caption ||
    data?.subtitle ||
    data?.description ||
    ""

  const sectionFactMetric =
    data?.sectionFactMetric ||
    data?.section_fact_metric ||
    data?.["metric-count"] ||
    data?.fact?.metric ||
    ""

  const sectionFactMetricText =
    data?.sectionFactMetricText ||
    data?.section_fact_metric_text ||
    data?.["metric-count-text"] ||
    data?.fact?.text ||
    ""

  const sectionBgImage =
    data?.["section-bg-image"] ||
    data?.sectionBgImage ||
    data?.backgroundImage ||
    "/homepage/clay/classroom-clay.webp"

  const cardPosition = (data?.["card-position"] || data?.cardPosition || "left").toLowerCase()
  const cardPositionClass = cardPosition === "right" ? "md:right-0" : "md:left-0"

  const features =
    data?.popup?.features?.length
      ? data.popup.features
      : data?.items?.length
        ? mapItemsToFeatures(data.items)
        : []

  useEffect(() => {
    if (!isExpanded) {
      return undefined
    }

    const lockedScrollY = window.scrollY
    const { style: htmlStyle } = document.documentElement
    const { style: bodyStyle } = document.body

    htmlStyle.overflow = "hidden"
    bodyStyle.overflow = "hidden"
    bodyStyle.position = "fixed"
    bodyStyle.top = `-${lockedScrollY}px`
    bodyStyle.left = "0"
    bodyStyle.right = "0"
    bodyStyle.width = "100%"

    return () => {
      htmlStyle.overflow = ""
      bodyStyle.overflow = ""
      bodyStyle.position = ""
      bodyStyle.top = ""
      bodyStyle.left = ""
      bodyStyle.right = ""
      bodyStyle.width = ""
      window.scrollTo(0, lockedScrollY)
    }
  }, [isExpanded])

  const scrollCards = (direction) => {
    const rail = cardsRailRef.current
    if (!rail) return

    const amount = Math.max(rail.clientWidth * 0.7, 260)
    rail.scrollBy({ left: direction * amount, behavior: "smooth" })
  }

  if (!program && !Object.keys(content ?? {}).length) {
    return null
  }

  const RootTag = overlay ? "div" : "section"
  const rootClassName = overlay
    ? "relative flex h-full  w-full"
    : "relative flex h-screen  w-full"

  return (
      <RootTag className={rootClassName}>
      {!isExpanded && (
        <div
          className={`absolute bottom-4 h-fit w-full max-w-[90vw] rounded-2xl border border-white/80 bg-white/30 p-2 backdrop-blur-3xl xl:top-24 2xl:top-30 md:max-w-[55ch] ${cardPositionClass}`}
        >
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <p className="text-caption uppercase">{sectionName}</p>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
              aria-label={`Open ${sectionName}`}
            >
              <img className="w-7" src="/icons/popup-arrow.svg" alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col items-start gap-2 rounded-xl bg-white p-4 md:gap-5 md:p-6">
            <p className="text-heading uppercase">{sectionTitle}</p>
            <div className="hidden h-[2px] w-full bg-black/5 md:block" />
            <div className="hidden flex-col gap-2 md:flex">
              <p className="text-body">{sectionSubtitle}</p>
              {(sectionFactMetric || sectionFactMetricText) && (
                <div className="flex items-center gap-1">
                  <p className="text-body-lg font-semibold">{sectionFactMetric}</p>
                  <p>{sectionFactMetricText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="fixed left-0 top-0 z-[1000] flex h-full w-full items-center justify-center bg-black/30">
          <div className="h-full w-full border border-white/80 bg-white/30 p-2 backdrop-blur-3xl md:h-[clamp(28rem,80vh,70rem)] md:max-w-[clamp(22rem,70vw,72rem)] md:rounded-2xl">
            <div className="flex h-full flex-col items-start gap-2 rounded-xl bg-white p-4 md:gap-5 md:p-6">
              <div className="flex w-full items-center justify-between">
                <p className="text-caption uppercase">{sectionName}</p>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10"
                  aria-label="Close popup"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex-col gap-2 pb-4">
                  <p className="text-body">{sectionSubtitle}</p>
                  {(sectionFactMetric || sectionFactMetricText) && (
                    <div className="flex items-center gap-1">
                      <p className="text-body-lg font-semibold">{sectionFactMetric}</p>
                      <p>{sectionFactMetricText}</p>
                    </div>
                  )}
                </div>

                <div className="hidden gap-2 md:flex">
                  <button
                    type="button"
                    onClick={() => scrollCards(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white"
                    aria-label="Scroll left"
                  >
                    <img className="w-4 rotate-90" src="/icons/down.svg" alt="" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCards(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white"
                    aria-label="Scroll right"
                  >
                    <img className="w-4 -rotate-90" src="/icons/down.svg" alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div
                ref={cardsRailRef}
                className="flex h-full w-full flex-col gap-4 overflow-y-auto pb-8 md:flex-row md:overflow-x-auto md:overflow-y-hidden md:pb-0"
              >
                {features.map((feature, index) => {
                  const featureTitle =
                    feature?.sectionNameTitle ||
                    feature?.section_name_title ||
                    feature?.title ||
                    feature?.name ||
                    `Feature ${index + 1}`

                  const featureDesc =
                    feature?.sectionNameDesc ||
                    feature?.section_name_desc ||
                    feature?.text ||
                    feature?.description ||
                    ""

                  const featureImg =
                    feature?.sectionNameImg ||
                    feature?.section_name_img ||
                    feature?.image ||
                    feature?.src ||
                    "/homepage/popup/classroom-clay.webp"

                  return (
                    <div
                      key={`${featureTitle}-${index}`}
                      className="h-fit flex-col gap-2 rounded-2xl border border-gray-300 p-2 md:flex md:min-w-70"
                    >
                      <img className="max-h-30 rounded-xl object-cover" src={featureImg} alt={featureTitle} />
                      <p className="text-caption uppercase">{featureTitle}</p>
                      <p>{featureDesc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </RootTag>
  )
}
