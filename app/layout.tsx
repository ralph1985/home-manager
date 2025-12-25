import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
    <html lang={locale}>
      <body className={`${manrope.variable} ${fraunces.variable} antialiased`}>{children}</body>
    </html>
  );
}
