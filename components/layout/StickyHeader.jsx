"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/beta", label: "Blog" },
  { href: "/section-cards-demo", label: "Contact" },
];

const CTA_LINK = { href: "/beta", label: "Book Admission" };

function MenuGlyph() {
  return (
    <Image
      src="/icons/menu.svg"
      alt=""
      width={18}
      height={18}
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    />
  );
}

export default function StickyHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex w-full flex-col">
        <div className="pointer-events-auto flex min-h-[68px] items-center justify-between border-b border-black/10 bg-white/28 px-4 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:px-5 lg:px-7">
          <Link href="/" className="shrink-0" aria-label="Apex Vision Model School homepage">
            <Image
              src="/icons/apex-full-logo.webp"
              alt="Apex Vision Model School"
              width={162}
              height={50}
              priority
              className="h-auto w-[112px] sm:w-[132px] lg:w-[150px]"
            />
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-8 pr-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-medium text-neutral-900 transition hover:text-neutral-600"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href={CTA_LINK.href}
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-neutral-100"
            >
              {CTA_LINK.label}
            </Link>

            <button
              type="button"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-neutral-100"
            >
              <MenuGlyph />
            </button>
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-neutral-100 md:hidden"
          >
            <MenuGlyph />
          </button>
        </div>

        {isOpen ? (
          <div className="pointer-events-auto border-b border-black/10 bg-white/84 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl md:ml-auto md:w-full md:max-w-sm md:rounded-bl-[28px]">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-4 py-3 text-[15px] font-medium text-neutral-900 transition hover:bg-black/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={CTA_LINK.href}
                onClick={() => setIsOpen(false)}
                className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-neutral-900 px-6 text-[15px] font-semibold text-white transition hover:bg-neutral-800"
              >
                {CTA_LINK.label}
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
