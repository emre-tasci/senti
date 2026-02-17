"use client";

import { CoinScopeLogo } from "./StableXLogo";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CoinScopeLogo size={18} className="text-muted-foreground" />
          <span>CoinScope &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs">
          Yatirim tavsiyesi degildir. / Not financial advice.
        </p>
      </div>
    </footer>
  );
}
