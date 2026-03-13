import SequenceChapter from "@/components/sequence/SequenceChapter"
import homeSequence from "@/data/sequence/home-sequence.json"

export default function SequencePage() {
  const chapter1 = homeSequence
  const chapter2 = {
    ...homeSequence,
    id: "home-sequence-2",
    showDebug: true,
  }

  return (
    <main className="bg-neutral-950 text-white">
      <SequenceChapter data={chapter1} />

      <section
        id="sec5"
        className="grid min-h-screen place-items-center bg-stone-100 px-6 py-16 text-center text-stone-900"
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-stone-500">Section 05</p>
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Normal sections can sit between immersive chapters.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-700 sm:text-lg">
            This section has no sequence logic at all. It exists only to verify that a long
            storytelling chapter can hand off cleanly into standard page content.
          </p>
        </div>
      </section>

      <section
        id="sec6"
        className="grid min-h-screen place-items-center bg-[#121826] px-6 py-16 text-center"
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-200/70">Section 06</p>
          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            The page can return to another sequence chapter later.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            The second chapter below reuses the same frame folder for testing so you can validate
            the architecture before moving it into the real homepage.
          </p>
        </div>
      </section>

      <SequenceChapter data={chapter2} />
    </main>
  )
}
