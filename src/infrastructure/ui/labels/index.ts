import { labels as en } from "@/infrastructure/ui/labels/en";
import { labels as es } from "@/infrastructure/ui/labels/es";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export type Labels = typeof es | typeof en;

export function getLabels(locale?: string | null): Labels {
  if (locale === "en") return en;
  return es;
}

export type CountLabel = {
  singular: string;
  plural: string;
};

export function formatCountLabel(count: number, label: CountLabel) {
  return `${count} ${count === 1 ? label.singular : label.plural}`;
}
