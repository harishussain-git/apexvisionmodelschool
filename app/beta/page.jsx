import HomeSequenceSection from "@/components/home/HomeSequenceSection";
import FakeRuntimeError from "@/components/home/sections/FakeRuntimeError";

export const metadata = {
  title: "Beta",
};

export default function BetaPage() {
  return (
    <main className="w-full bg-black">
      <HomeSequenceSection />

      <section id="more-details" className="w-full h-screen">
        <FakeRuntimeError />
      </section>

      <section id="footer" className="w-full h-screen">
        <FakeRuntimeError />
      </section>
    </main>
  );
}
