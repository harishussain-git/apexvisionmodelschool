import moreDetail from "@/data/home/more-detail.json";

export default function MoreDetailSection() {
  const leftPoints = moreDetail.points.slice(0, 4);
  const rightPoints = moreDetail.points.slice(4);

  return (
    <section
      id="more-detail"
      className="w-full bg-primary-500 backdrop-blur-2xl text-white"
    >
      <div className="mx-auto grid min-h-screen w-full max-w-screen-2xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-2 md:px-8 md:py-14 items-center">
        
        <div className="flex flex-col gap-4">
          <p className="text-caption uppercase">{moreDetail.eyebrow}</p>
          <h2 className="font-accent uppercase text-4xl leading-tight md:text-7xl">
            {moreDetail.heading}
          </h2>
          <p className="max-w-[48ch] text-body">{moreDetail.description}</p>
        </div>

        <div className="flex flex-col gap-8">
          <a
            href={moreDetail.cta.href}
            className="ml-auto text-body underline underline-offset-4"
          >
            {moreDetail.cta.label} {"\u2197"}
          </a>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              {leftPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-4 w-4 rounded-full border border-white/80" />
                  <p className="text-body">{point}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              {rightPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-4 w-4 rounded-full border border-white/80" />
                  <p className="text-body">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
