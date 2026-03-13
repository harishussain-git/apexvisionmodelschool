"use client"

export default function HeroSection({ overlay = false, content = {} }) {
  const RootTag = overlay ? "div" : "section"
  const rootClassName = overlay
    ? "relative h-full w-full"
    : "relative h-screen w-full bg-gray-500"

  const eyebrowValue = content.eyebrowValue ?? "45+"
  const eyebrow = content.eyebrow ?? "Years of Educational Excellence"
  const title = content.title ?? "Education that shapes character and confidence"
  const subheading =
    content.subheading ??
    "We guide students through a thoughtful journey balancing academic excellence, moral grounding, family values, and the skills needed for the modern world."

  return (
    <RootTag id={overlay ? undefined : "hero"} className={rootClassName}>
      <div className="absolute inset-0 z-20">
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex w-full flex-col items-center justify-center gap-4 pt-30">
            <p className="font-body flex items-center justify-center gap-2 uppercase tracking-wide text-primary-500">
              <span className="rounded bg-primary-500 p-1.5 text-[12px] font-normal text-white">
                {eyebrowValue}
              </span>
              {eyebrow}
            </p>

            <h1 className="font-accent text-display max-w-[24ch] text-center font-semibold uppercase">
              {title}
            </h1>

            <p className="font-body hidden max-w-[64ch] text-center md:block">{subheading}</p>
          </div>

          <div className="w-full pb-6">
            <div className="mx-auto grid max-w-screen-2xl grid-cols-3 items-end px-8">
              <div className="hidden md:block" aria-hidden="true" />
              <div className="hidden justify-items-center md:block" />
              <div className="justify-self-end" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {!overlay && (
        <img
          className="absolute left-0 top-0 z-10 h-full w-full object-cover saturate-0"
          src="/homepage/clay/hero-clay.webp"
          alt="hero"
        />
      )}
    </RootTag>
  )
}
