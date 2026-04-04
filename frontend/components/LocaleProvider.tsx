"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  type Locale, type T,
  translations, detectLocale, getCurrency, formatPrice,
} from "../lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: T;
  currency: string;
  /** Format a USD amount in the user's detected currency (same amount, local symbol) */
  price: (amount: number) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "docuflow_locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [currency, setCurrency] = useState("USD");
  const [browserLocale, setBrowserLocale] = useState("en-US");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const detected = detectLocale();
    const resolved: Locale = saved ?? detected;
    setLocaleState(resolved);

    const bl = navigator.language;
    setBrowserLocale(bl);
    setCurrency(getCurrency(bl));
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const price = (amount: number) => formatPrice(amount, currency, browserLocale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale], currency, price }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
