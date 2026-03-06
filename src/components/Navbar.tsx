"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "./comments/AuthButton";

const links = [
  { href: "/", label: "Home" },
  { href: "/contracts", label: "Contracts" },
  { href: "/audits", label: "Audits" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[#f0f6fc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} />
          Source of Clarity
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-[#f0f6fc] ${
                pathname === link.href ? "text-[#f0f6fc]" : "text-[#8b949e]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <AuthButton compact />
        </div>
      </div>
    </nav>
  );
}
