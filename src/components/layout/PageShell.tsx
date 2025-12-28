import type { ReactNode } from "react";

import Header from "@/components/layout/Header";

type PageShellProps = {
  children: ReactNode;
};

export default async function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[color:var(--foreground)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[var(--glow-sand)] blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[var(--glow-sage)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--glow-sun)] blur-3xl" />
      </div>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <Header />
        {children}
      </main>
    </div>
  );
}
