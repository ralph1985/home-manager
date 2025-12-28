import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.scss";
import "./tailwind.css";

import { getServerLabels, getServerLocale } from "@/infrastructure/ui/labels/server";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const themeInitScript = `
(() => {
  const storageKey = "hm_theme";
  const stored = window.localStorage.getItem(storageKey);
  const isTheme = stored === "light" || stored === "dark";
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = isTheme ? stored : preferred;
  document.documentElement.dataset.theme = theme;
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const labels = await getServerLabels();
  return {
    title: labels.meta.title,
    description: labels.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className={`${manrope.variable} ${fraunces.variable} antialiased`}>{children}</body>
    </html>
  );
}
