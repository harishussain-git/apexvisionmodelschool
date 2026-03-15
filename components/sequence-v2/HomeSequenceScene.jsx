"use client"

import CloudTextSection from "@/components/home/CloudTextSection"
import HeroSection from "@/components/home/HeroSection"
import ProgramSection from "@/components/home/ProgramSection"
import SchoolFrontSection from "@/components/home/SchoolFrontSection"

import SequenceSection from "@/components/sequence-v2/SequenceSection"

const HOME_SEQUENCE_STRUCTURE = [
  { id: "hero", Component: HeroSection },
  { id: "cloudtext", Component: CloudTextSection },
  { id: "school-front", Component: SchoolFrontSection },
  { id: "classroom", Component: ProgramSection, isProgram: true },
  { id: "educraft", Component: ProgramSection, isProgram: true },
  { id: "karate", Component: ProgramSection, isProgram: true },
  { id: "carpenter", Component: ProgramSection, isProgram: true },
  { id: "sports", Component: ProgramSection, isProgram: true },
  { id: "communication", Component: ProgramSection, isProgram: true },
]

const HOME_SEQUENCE_SECTION_MAP = Object.fromEntries(
  HOME_SEQUENCE_STRUCTURE.map((item) => [item.id, item])
)

function renderHomeAnchor(anchor) {
  const config = HOME_SEQUENCE_SECTION_MAP[anchor?.id]

  if (!config) {
    return undefined
  }

  const { Component, isProgram } = config

  if (isProgram) {
    return <Component overlay program={anchor.id} content={anchor.content} />
  }

  return <Component overlay content={anchor.content} />
}

export default function HomeSequenceScene({ data }) {
  return <SequenceSection data={data} renderAnchor={renderHomeAnchor} />
}
