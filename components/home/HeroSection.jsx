"use client";

export default function HeroSection() {
  return (
    <section id="hero" className="relative w-full bg-gray-500 h-screen">

      <div className="absolute inset-0 z-20">


        <div className="w-full   flex flex-col justify-between">

          <div className="pt-30 flex flex-col items-center justify-center gap-4 w-full">

            <p className="uppercase font-body flex  tracking-wide justify-center items-center gap-2 font-semibold text-primary-500"><span className="bg-primary-500 text-white p-1.5 rounded text-[12px] font-normal">45+</span> Years of Educational Excellence</p>

            <h1 className="text-display font-semibold font-accent uppercase text-center max-w-[24ch]">Education that shapes character and confidence</h1>

            <p className=" font-body text-center  max-w-[64ch] hidden md:block">We guide students through a thoughtful journey —  balancing academic excellence, moral grounding, family values, and the skills needed for the modern world.</p>
          </div>


          <div className="pb-6 w-full">
            <div className="max-w-screen-2xl px-8 grid grid-cols-3 items-end mx-auto">
              <div className="hidden md:block" aria-hidden="true" />
              <div className="hidden md:block justify-items-center" />
              <div className="justify-self-end" aria-hidden="true" />
            </div>
          </div>

        </div>

      </div>


      <img className="saturate-0 absolute top-0 left-0 z-10 h-full w-full object-cover" src="/homepage/clay/hero-clay.webp" alt="hero" />

    </section>
  )
}
