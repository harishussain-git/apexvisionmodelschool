import ContactSection from "@/components/home/ContactSection"
import FooterSection from "@/components/home/FooterSection"
import MoreDetailSection from "@/components/home/MoreDetailSection"
import HomeSequenceScene from "@/components/sequence-v2/HomeSequenceScene"
import PageSectionSnap from "@/components/ui/PageSectionSnap"
import sequenceData from "@/data/sequence-v2/home-sequence.json"

export default function SequenceV2Page() {
  return (
    <main className="bg-neutral-950 text-white ">
      <PageSectionSnap
        sections={[
          // The sequence chapter is long, so we only snap near the top or bottom edges.
          { id: "home-story", upThreshold: 0.03, downThreshold: 0.97, cooldownMs: 1400, lenisDuration: 1.2 },
          { id: "more-detail", upThreshold: 0.12, downThreshold: 0.88, cooldownMs: 1100, lenisDuration: 1.05 },
          { id: "contact", upThreshold: 0.12, downThreshold: 0.9, cooldownMs: 1100, lenisDuration: 1.05 },
          { id: "footer", upThreshold: 0.18, downThreshold: 1, cooldownMs: 900, lenisDuration: 0.9 },
        ]}
      />
      <HomeSequenceScene data={sequenceData} />
      <MoreDetailSection />
      <ContactSection />
      <FooterSection />
    </main>
  )
}
