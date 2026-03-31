export default function SchoolFrontSection({ overlay = false, content = {} }) {
  const RootTag = overlay ? "div" : "section"
  const title = content.title ?? "Every journey begins with purpose, direction, and care"
  const description =
    content.description ??
    "At Apex Vision Model School, learning goes beyond classrooms. Through modern facilities, innovative curriculum, and diverse activities, "
  const linkText = content.linkText ?? "Let's explore."
  const linkHref = content.linkHref ?? "#"
  const buttonText = content.buttonText ?? ""

  return (
    <RootTag
      className={
        overlay
          ? "relative flex h-full w-full items-end justify-center"
          : "relative flex h-screen w-full items-center justify-center "
      }
    >
      <div className="z-300 absolute bottom-10 h-fit max-w-[90vw] rounded-2xl border border-white/80 bg-white/30 p-2 backdrop-blur-3xl md:right-10 md:top-30 md:max-w-[55ch]">
        <div className="flex flex-col items-start gap-6 rounded-xl bg-white p-4 md:p-6">
          <p className="text-heading uppercase">{title}</p>

          <div className="hidden h-[2px] w-full bg-black/5 md:block" />

          <p className="text-body hidden md:block">
            {description}{" "}
            <a href={linkHref} className="cursor-pointer underline">
              {linkText}
            </a>
          </p>

          {buttonText ? (
            <button className="inline-flex min-h-11 items-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white">
              {buttonText}
            </button>
          ) : null}
        </div>
      </div>
    </RootTag>
  )
}
