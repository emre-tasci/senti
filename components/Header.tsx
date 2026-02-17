"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "./LocaleProvider";
import { Button } from "@/components/ui/button";

export function Header() {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center text-lg text-primary-foreground" style={{ fontWeight: 300 }}>
          CoinScope
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground transition-colors rounded-md hover:bg-white/10"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/market"
            className="px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground transition-colors rounded-md hover:bg-white/10"
          >
            {t("nav.market")}
          </Link>
          <Link
            href="/category"
            className="px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground transition-colors rounded-md hover:bg-white/10"
          >
            {t("nav.categories")}
          </Link>
          <div className="ml-2 flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary px-4 pb-4 pt-2 space-y-2">
          <Link
            href="/"
            className="block px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/market"
            className="block px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.market")}
          </Link>
          <Link
            href="/category"
            className="block px-3 py-2 text-sm font-medium text-primary-foreground/75 hover:text-primary-foreground rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.categories")}
          </Link>
          <div className="flex items-center gap-2 px-3 pt-2 border-t border-white/10">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
