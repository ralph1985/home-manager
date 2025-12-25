"use client";

import { useEffect, useState } from "react";

import { localeCookieName, localeStorageKey } from "@/infrastructure/ui/labels/constants";
import { locales, type Labels, type Locale } from "@/infrastructure/ui/labels";

type LocaleSwitchProps = {
  currentLocale: Locale;
  labels: Labels["common"];
};

function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default function LocaleSwitch({ currentLocale, labels }: LocaleSwitchProps) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return currentLocale;
    const stored = window.localStorage.getItem(localeStorageKey);
    return stored && isLocale(stored) ? stored : currentLocale;
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(localeStorageKey);
    if (!stored || !isLocale(stored)) {
      window.localStorage.setItem(localeStorageKey, currentLocale);
      document.cookie = `${localeCookieName}=${currentLocale}; path=/; max-age=31536000`;
      return;
    }
    if (stored !== currentLocale) {
      document.cookie = `${localeCookieName}=${stored}; path=/; max-age=31536000`;
      window.location.reload();
      return;
    }
    document.cookie = `${localeCookieName}=${stored}; path=/; max-age=31536000`;
  }, [currentLocale]);

  const handleChange = (next: string) => {
    if (!isLocale(next)) return;
    window.localStorage.setItem(localeStorageKey, next);
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000`;
    setLocale(next);
    window.location.reload();
  };

  return (
    <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      <span>{labels.languageLabel}</span>
      <select
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="es">{labels.languageOptions.es}</option>
        <option value="en">{labels.languageOptions.en}</option>
      </select>
    </label>
  );
}
