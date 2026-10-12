"use client";

import { useState } from "react";
import { Briefcase, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#search", label: "Search" },
  { href: "#results", label: "Results" },
  { href: "#how-it-works", label: "How it works" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
            <Briefcase className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Job<span className="text-brand-600">Scout</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-zinc-100 hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#search" className="btn-primary hidden px-4 py-2 text-sm md:inline-flex">
            Find jobs
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-zinc-200/70 bg-white px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
