import { cookies } from "next/headers";

import { localeCookieName } from "@/infrastructure/ui/labels/constants";
import { getLabels, locales, type Labels, type Locale } from "@/infrastructure/ui/labels";

export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }
  return "es";
}

export async function getServerLabels(): Promise<Labels> {
  return getLabels(await getServerLocale());
}
