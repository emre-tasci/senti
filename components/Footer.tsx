"use client";

import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>CoinSentinel &copy; {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs">
          Yatirim tavsiyesi degildir. / Not financial advice.
        </p>
      </div>
    </footer>
  );
}
