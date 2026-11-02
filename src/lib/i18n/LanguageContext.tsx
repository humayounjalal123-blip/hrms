"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Dictionary, getDictionary } from "./dictionaries";
import {
  DEFAULT_LOCALE,
  LANG_STORAGE_KEY,
  Locale,
  getLocaleMeta,
  isLocale,
} from "./locales";

type LanguageContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const meta = getLocaleMeta(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = meta.dir;
  document.documentElement.dataset.locale = locale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    const next = isLocale(stored) ? stored : DEFAULT_LOCALE;
    setLocaleState(next);
    applyDocumentLocale(next);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
    applyDocumentLocale(next);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const meta = getLocaleMeta(locale);
    return {
      locale,
      dir: meta.dir,
      t: getDictionary(locale),
      setLocale,
    };
  }, [locale, setLocale]);

  // Avoid a flash of wrong direction; still render children once mounted state syncs
  if (!ready) {
    return (
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}
