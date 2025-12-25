import Link from "next/link";

import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";

export default async function Home() {
  const labels = await getServerLabels();

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.dashboard.eyebrow}
        title={labels.dashboard.title}
        description={labels.dashboard.description}
        actionNode={
          <InfoPanel label={labels.common.panelActiveLabel} value={labels.dashboard.panelCode} />
        }
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {labels.dashboard.homesSectionTitle}
          </h2>
        </div>

        <div className="hm-panel mt-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {labels.dashboard.homesCardTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{labels.dashboard.homesCardDescription}</p>
          </div>
          <Link
            className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/homes"
          >
            {labels.dashboard.homesLinkLabel}
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {labels.dashboard.vehiclesSectionTitle}
          </h2>
        </div>

        <div className="hm-panel mt-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {labels.dashboard.vehiclesCardTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {labels.dashboard.vehiclesCardDescription}
            </p>
          </div>
          <Link
            className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/vehicles"
          >
            {labels.dashboard.vehiclesLinkLabel}
          </Link>
        </div>
      </section>

      <section className="hm-panel mt-12 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {labels.dashboard.nextStepEyebrow}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {labels.dashboard.nextStepTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{labels.dashboard.nextStepDescription}</p>
          </div>
          <span className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-400">
            {labels.dashboard.nextStepTag}
          </span>
        </div>
      </section>
    </PageShell>
  );
}
