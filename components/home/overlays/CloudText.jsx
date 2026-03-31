function Highlight({ children }) {
  return <span className="text-white">{children}</span>;
}

export default function CloudText() {
  return (
    <div className="w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
      <h1 className="font-accent text-left font-black uppercase leading-[0.98] tracking-[0.03em] text-[#2f469e] text-[clamp(2.35rem,4.9vw,5.8rem)]">
        <span className="block">Apex Model School Sharjah Empowers Young</span>
        <span className="mt-[0.18em] block">
          Minds To <Highlight>Learn, Explore,</Highlight> And Grow. Preparing
        </span>
        <span className="mt-[0.18em] block">
          Students With <Highlight>Knowledge, Character,</Highlight> And
        </span>
        <span className="mt-[0.18em] block">
          <Highlight>Confidence</Highlight> For The Future.
        </span>
      </h1>
    </div>
  );
}
