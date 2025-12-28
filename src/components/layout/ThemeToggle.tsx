"use client";

import { useEffect, useSyncExternalStore } from "react";

import PillButton from "@/components/PillButton";
import { getPreferredTheme, isTheme, themeStorageKey, type Theme } from "@/infrastructure/ui/theme";
import type { Labels } from "@/infrastructure/ui/labels";

type ThemeToggleProps = {
  labels: Labels["common"];
};

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function subscribe(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey) {
      callback();
    }
  };

  const handleThemeChange = () => callback();
  window.addEventListener("storage", handleStorage);
  window.addEventListener("theme-change", handleThemeChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("theme-change", handleThemeChange);
  };
}

function getSnapshot(): Theme {
  const stored = window.localStorage.getItem(themeStorageKey);
  return stored && isTheme(stored) ? stored : getPreferredTheme();
}

function getServerSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle({ labels }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLabel = nextTheme === "dark" ? labels.themeToggleDark : labels.themeToggleLight;

  return (
    <PillButton
      type="button"
      variant="outline"
      size="xsWide"
      suppressHydrationWarning
      aria-label={nextLabel}
      title={nextLabel}
      onClick={() => {
        applyTheme(nextTheme);
        window.localStorage.setItem(themeStorageKey, nextTheme);
        window.dispatchEvent(new Event("theme-change"));
      }}
    >
      {theme === "dark" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
      <span className="sr-only">{labels.themeToggleLabel}</span>
    </PillButton>
  );
}
