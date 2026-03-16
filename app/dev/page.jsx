import ContactSection from "@/components/home/ContactSection"
import FooterSection from "@/components/home/FooterSection"
import MoreDetailSection from "@/components/home/MoreDetailSection"
import HomeSequenceScene from "@/components/dev/HomeSequenceScene"
import sequenceData from "@/data/dev/home-sequence.json"

export default function DevPage() {
  return (
    <main className="bg-neutral-950 text-white saturate-0 ">
      <HomeSequenceScene data={sequenceData} />      
      <MoreDetailSection />
      <ContactSection />
      <FooterSection />
    </main>
  )
}
