import LocaleSwitch from "@/components/layout/LocaleSwitch";
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {labels.meta.title}
          </p>
          <p className="text-sm text-slate-500">{labels.meta.description}</p>
        </div>
      </div>
      <LocaleSwitch currentLocale={locale} labels={labels.common} />
    </header>
  );
}
