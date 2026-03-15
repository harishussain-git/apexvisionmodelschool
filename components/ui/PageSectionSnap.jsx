"use client"

import usePageSectionSnap from "@/hooks/usePageSectionSnap"

export default function PageSectionSnap({ sections = [] }) {
  usePageSectionSnap({ sections })

  return null
}
