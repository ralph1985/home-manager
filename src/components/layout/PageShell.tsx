import type { ReactNode } from "react";

import LocaleSwitch from "@/components/layout/LocaleSwitch";
import { getServerLabels, getServerLocale } from "@/infrastructure/ui/labels/server";

type PageShellProps = {
  children: ReactNode;
};

export default async function PageShell({ children }: PageShellProps) {
  const labels = await getServerLabels();
  const locale = await getServerLocale();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#f1c7a6]/60 blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[#b9d7d3]/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f8e6cc]/80 blur-3xl" />
      </div>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {labels.dashboard.panelCode}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {labels.meta.title}
              </p>
              <p className="text-sm text-slate-500">{labels.meta.description}</p>
            </div>
          </div>
          <LocaleSwitch currentLocale={locale} labels={labels.common} />
        </header>
        {children}
      </main>
    </div>
  );
}
