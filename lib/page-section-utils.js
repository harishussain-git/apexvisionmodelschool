import { clamp, getSectionMetrics, getTargetElement, normalizeTarget } from "@/components/ui/snap-utils"

export function normalizePageSections(sections = []) {
  return sections
    .map((section, index, collection) => {
      const target = normalizeTarget(section?.target || section?.id)

      if (!target) {
        return null
      }

      const previousSection = collection[index - 1]
      const nextSection = collection[index + 1]

      return {
        target,
        enabled: section?.enabled !== false,
        upTarget: normalizeTarget(section?.upTarget || previousSection?.target || previousSection?.id),
        downTarget: normalizeTarget(section?.downTarget || nextSection?.target || nextSection?.id),
        upThreshold: clamp(section?.upThreshold ?? 0.1, 0, 1),
        downThreshold: clamp(section?.downThreshold ?? 0.9, 0, 1),
        cooldownMs: Math.max(0, section?.cooldownMs ?? 1100),
        lenisDuration: Math.max(0, section?.lenisDuration ?? 1.15),
        label: section?.label || "Scroll",
      }
    })
    .filter(Boolean)
}

export function getActivePageSectionState(sections, scrollY) {
  let firstResolvedSection = null
  let lastResolvedSection = null

  for (const config of sections) {
    const element = getTargetElement(config.target)
    if (!element) {
      continue
    }

    const metrics = getSectionMetrics(element, scrollY)
    const sectionBottom = metrics.sectionTop + metrics.sectionHeight
    const state = {
      config,
      element,
      metrics,
    }

    if (!firstResolvedSection) {
      firstResolvedSection = state
    }

    lastResolvedSection = state

    if (scrollY >= metrics.sectionTop && scrollY < sectionBottom) {
      return state
    }

    if (scrollY < metrics.sectionTop) {
      return lastResolvedSection ?? state
    }
  }

  return lastResolvedSection ?? firstResolvedSection
}
