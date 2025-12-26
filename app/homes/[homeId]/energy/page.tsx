import Link from "next/link";
import { notFound } from "next/navigation";

import EnergyBillsTable from "@/components/billing/EnergyBillsTable";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { listEnergyBillsUseCase } from "@/usecases/energyBills";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

type EnergyPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function EnergyPage({ params }: EnergyPageProps) {
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

  const bills = await listEnergyBillsUseCase(homeId);
  const toNumber = (value?: { toString(): string } | null) =>
    value == null ? null : Number(value.toString());

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.energy.eyebrow}
        title={`${labels.energy.titlePrefix} ${home.name}`}
        description={labels.energy.description}
        actionNode={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
              href={`/homes/${home.id}`}
            >
              {labels.common.backToPanel}
            </Link>
            <Link
              className="hm-pill bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              href={`/homes/${home.id}/energy/comparison`}
            >
              {labels.energy.comparison.actionLabel}
            </Link>
          </div>
        }
      />
      <EnergyBillsTable
        title={labels.energy.listTitle}
        emptyMessage={labels.energy.emptyList}
        labels={labels}
        bills={bills.map((bill) => {
          const consumptionKwh = toNumber(bill.consumptionKwh);
          return {
            id: bill.id,
            providerName: bill.provider?.name,
            invoiceNumber: bill.invoiceNumber,
            issueDate: bill.issueDate.getTime(),
            periodStart: bill.periodStart?.getTime() ?? null,
            periodEnd: bill.periodEnd?.getTime() ?? null,
            totalAmount: bill.totalAmount.toString(),
            totalAmountValue: Number(bill.totalAmount.toString()),
            consumptionLabel: consumptionKwh ? `${consumptionKwh} ${labels.units.kwh}` : null,
            consumptionKwh,
            pdfUrl: bill.pdfUrl ?? null,
            href: `/homes/${home.id}/energy/${bill.id}`,
          };
        })}
      />
    </PageShell>
  );
}
