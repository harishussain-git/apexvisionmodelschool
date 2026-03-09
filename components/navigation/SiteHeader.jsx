import Link from "next/link";

const SiteHeader = () => {
  return (
    <header className="relative h-full w-full ">
      <div className="bg-white/40 backdrop-blur-2xl fixed z-1000 top-0 mx-auto h-fit py-3 w-full items-center justify-between flex px-4 md:px-8">
        
        <div className=" mx-auto flex justify-between w-full items-center">
          <Link href="#" className="text-lg font-semibold text-primary-500">
            <img className="h-[clamp(32px,2.5vw,48px)] w-auto" src="/icons/apex-full-logo.webp" alt="Apex logo" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-body  text-black">
            <Link href="/en">EN</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <Link className="bg-white px-4 py-2 rounded-full" href="/book-admission">Book Admission</Link>
          </nav>

          <button type="button" className="md:hidden p-2 rounded-full bg-white" aria-label="Open menu">
            <img className="w-5" src="/icons/menu.svg" alt="Menu" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
