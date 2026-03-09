import HeroSection from "@/components/home/HeroSection"
import SchoolFrontSection from "@/components/home/SchoolFrontSection"
import ProgramSection from "@/components/home/ProgramSection"
import MoreDetailSection from "@/components/home/MoreDetailSection"
import ContactSection from "@/components/home/ContactSection"
import FooterSection from "@/components/home/FooterSection"
import CloudTextSection from "@/components/home/CloudTextSection"

export default function DevPage() {
  return (
    <>
      <HeroSection />
      <CloudTextSection />
      <SchoolFrontSection />
      <ProgramSection program="classroom" />
      <ProgramSection program="educraft" />
      <ProgramSection program="karate" />
      <ProgramSection program="carpenter" />
      <ProgramSection program="sports" />
      <ProgramSection program="communication" />

      <MoreDetailSection />
      <ContactSection />
      {/* <FooterSection /> */}
    </>
  )
}
