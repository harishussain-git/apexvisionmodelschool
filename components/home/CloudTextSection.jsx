import React from "react"

const CloudTextSection = ({ overlay = false, content = {} }) => {
  const title =
    content.title ??
    "Apex Vision Model School Sharjah empowers young minds to learn, explore, and grow. A premium new venture backed by 50+ years of expertise."

  return (
    <div
      id={overlay ? undefined : "cloud-text"}
      className={
        overlay
          ? "h-full w-full"
          : "h-[200vh] w-full bg-[url('/homepage/bigtext-clouds-bg.webp')] bg-cover bg-center saturate-0"
      }
    >
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-center px-8 md:px-22">
        <p className="font-accent text-display-xl text-center font-semibold">{title}</p>
      </div>
    </div>
  )
}

export default CloudTextSection
