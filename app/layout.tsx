import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.scss";
import "./tailwind.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Manager",
  description: "Panel de control para la gestion del hogar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} antialiased`}>{children}</body>
    </html>
  );
}
