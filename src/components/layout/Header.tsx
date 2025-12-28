import Link from "next/link";

import LocaleSwitch from "@/components/layout/LocaleSwitch";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { getServerLabels, getServerLocale } from "@/infrastructure/ui/labels/server";

export default async function Header() {
  const labels = await getServerLabels();
  const locale = await getServerLocale();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
          {labels.dashboard.panelCode}
        </div>
        <div>
          <Link
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-subtle)] hover:text-[color:var(--text-strong)]"
            href="/"
          >
            {labels.meta.title}
          </Link>
          <p className="text-sm text-[color:var(--text-subtle)]">{labels.meta.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LocaleSwitch currentLocale={locale} labels={labels.common} />
        <ThemeToggle labels={labels.common} />
      </div>
    </header>
  );
}
