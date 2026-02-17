"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { t as translate, getDefaultLocale } from "@/lib/i18n";
import { getSavedLocale, saveLocale } from "@/lib/storage";
import type { Locale } from "@/types";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "tr",
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale());

  // Read persisted locale on mount
  useEffect(() => {
    const saved = getSavedLocale();
    if (saved) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
