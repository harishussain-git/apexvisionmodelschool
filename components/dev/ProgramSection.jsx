import programs from "@/data/home/programs.json"

export default function ProgramSection({ program }) {
  const data = programs?.[program]
  if (!data) {
    return null
  }

  return (
    <section>
      <h2>{data.title}</h2>
      <p>{data.subtitle}</p>
      <p>{data.caption}</p>
    </section>
  )
}
