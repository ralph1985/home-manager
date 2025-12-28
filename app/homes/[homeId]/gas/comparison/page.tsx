import { notFound } from "next/navigation";

import YearComparisonSection from "@/components/billing/YearComparisonSection";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import PillButton from "@/components/PillButton";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getGasComparisonUseCase } from "@/usecases/gasComparison";
import { getHomeUseCase } from "@/usecases/homes";
import { listGasBillYearsUseCase } from "@/usecases/gasBills";

export const runtime = "nodejs";

type GasComparisonPageProps = {
  params: Promise<{ homeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseYear(value: string | string[] | undefined) {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const year = Number.parseInt(raw, 10);
  return Number.isNaN(year) ? null : year;
}

function resolveYears(availableYears: number[], yearA?: number | null, yearB?: number | null) {
  if (availableYears.length === 0) {
    return { yearA: null, yearB: null };
  }

  const latest = availableYears[0];
  const previous = availableYears[1] ?? latest;
  let resolvedA = yearA && availableYears.includes(yearA) ? yearA : previous;
  let resolvedB = yearB && availableYears.includes(yearB) ? yearB : latest;

  if (resolvedA === resolvedB && availableYears.length > 1) {
    resolvedA = previous;
    resolvedB = latest;
  }

  return { yearA: resolvedA, yearB: resolvedB };
}

export default async function GasComparisonPage({ params, searchParams }: GasComparisonPageProps) {
  const labels = await getServerLabels();
  const { homeId: rawHomeId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);

  if (Number.isNaN(homeId)) {
    notFound();
  }

  const home = await getHomeUseCase(homeId);

  if (!home) {
    notFound();
  }

  const search = (await searchParams) ?? {};
  const availableYears = await listGasBillYearsUseCase(homeId);
  const requestedYearA = parseYear(search.yearA);
  const requestedYearB = parseYear(search.yearB);
  const { yearA, yearB } = resolveYears(availableYears, requestedYearA, requestedYearB);
  const comparison =
    yearA != null && yearB != null ? await getGasComparisonUseCase(homeId, yearA, yearB) : null;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gas.eyebrow}
        title={`${labels.gas.comparison.title} ${yearA ?? ""} vs ${yearB ?? ""} - ${home.name}`}
        description={`${labels.gas.comparison.description} (${yearA ?? "?"} vs ${yearB ?? "?"})`}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${home.id}/gas`}
      />
      <section className="mt-8">
        <form className="hm-panel flex flex-wrap items-end gap-4 p-4" method="get">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
            <span>{labels.gas.comparison.filters.yearA}</span>
            <select
              className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
              name="yearA"
              defaultValue={yearA ?? undefined}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
            <span>{labels.gas.comparison.filters.yearB}</span>
            <select
              className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
              name="yearB"
              defaultValue={yearB ?? undefined}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <PillButton type="submit" variant="solid" size="xsWide">
            {labels.gas.comparison.filters.apply}
          </PillButton>
        </form>
      </section>
      <YearComparisonSection
        labels={labels}
        comparison={comparison}
        billPathPrefix={`/homes/${home.id}/gas`}
        usageUnit={labels.units.kwh}
        copy={labels.gas.comparison}
      />
    </PageShell>
  );
}
