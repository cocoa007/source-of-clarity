"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-card-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} />
          Source of Clarity
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              asChild
              className={pathname === link.href ? "text-card-foreground" : "text-muted-foreground"}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <div className="ml-3">
            <AuthButton compact />
          </div>
        </div>
      </div>
    </nav>
  );
}
