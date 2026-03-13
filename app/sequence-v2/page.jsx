import SequenceChapter from "@/components/sequence-v2/SequenceChapter"
import homeSections from "@/data/sequence-v2/home-sections.json"

function MoreDetailSection() {
  return (
    <section className="grid min-h-screen place-items-center bg-stone-100 px-6 py-16 text-center text-stone-900">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-stone-500">More Detail</p>
        <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Standard sections still fit naturally after the sequence flow.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-stone-700 sm:text-lg">
          This is a placeholder for your real MoreDetailSection. The page architecture already
          supports mixing normal sections into the same array-driven flow.
        </p>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#101723] px-6 py-16 text-center text-white">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-200/70">Contact</p>
        <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Finish the journey with a clear next step.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
          This is a placeholder for your real ContactSection. Replace it later without changing the
          sequence system.
        </p>
      </div>
    </section>
  )
}

function renderNormalSection(section) {
  if (section.contentType === "more-detail") {
    return <MoreDetailSection key={section.id} />
  }

  if (section.contentType === "contact") {
    return <ContactSection key={section.id} />
  }

  return null
}

export default function SequenceV2Page() {
  return (
    <main className="bg-neutral-950 text-white">
      {homeSections.map((section) => {
        if (section.sectionKind === "sequence") {
          return <SequenceChapter key={section.id} data={section} />
        }

        return renderNormalSection(section)
      })}
    </main>
  )
}
