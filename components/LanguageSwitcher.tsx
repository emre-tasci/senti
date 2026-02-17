"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
      className="gap-1.5 text-xs font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
    >
      <Globe className="h-4 w-4" />
      {locale === "tr" ? "EN" : "TR"}
    </Button>
  );
}
