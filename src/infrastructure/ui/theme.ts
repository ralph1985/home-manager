export const themeStorageKey = "hm_theme";

export const themes = ["light", "dark"] as const;
export type Theme = (typeof themes)[number];

export function isTheme(value: string): value is Theme {
  return themes.includes(value as Theme);
}

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
