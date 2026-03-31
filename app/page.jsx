import Link from "next/link";

export const metadata = {
  title: "Apex Manual",
};

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-neutral-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-white/45">
            Site Status
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Site under development.
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/68">
            The current build is still in progress. Visit the beta preview to
            check the latest status and ongoing interaction work.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/beta"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
            >
              Visit Beta
            </Link>
            {/* <Link
              href="/section-cards-demo"
              className="inline-flex items-center justify-center rounded-full border border-white/14 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            >
              View Demo
            </Link> */}
          </div>
        </div>
      </div>
    </main>
  );
}

