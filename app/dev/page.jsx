import HeroSection from "@/components/dev/HeroSection"
import SchoolFrontSection from "@/components/dev/SchoolFrontSection"
import ProgramSection from "@/components/dev/ProgramSection"
import MoreDetailsSection from "@/components/dev/MoreDetailsSection"
import FooterSection from "@/components/dev/FooterSection"

export default function DevPage() {
  return (
    <>
      <HeroSection />
      <SchoolFrontSection />

      <ProgramSection program="classroom" />
      <ProgramSection program="educraft" />
      <ProgramSection program="karate" />
      <ProgramSection program="carpenter" />
      <ProgramSection program="sports" />
      <ProgramSection program="communication" />

      <MoreDetailsSection />
      <FooterSection />
    </>
  )
}