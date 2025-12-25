import { notFound } from "next/navigation";

import GasBillsTable from "@/components/billing/GasBillsTable";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { listGasBillsUseCase } from "@/usecases/gasBills";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

type GasPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function GasPage({ params }: GasPageProps) {
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

  const bills = await listGasBillsUseCase(homeId);
  const toNumber = (value?: { toString(): string } | null) =>
    value == null ? null : Number(value.toString());

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gas.eyebrow}
        title={`${labels.gas.titlePrefix} ${home.name}`}
        description={labels.gas.description}
        actionLabel={labels.common.backToPanel}
        actionHref={`/homes/${home.id}`}
      />
      <GasBillsTable
        title={labels.gas.listTitle}
        emptyMessage={labels.gas.emptyList}
        labels={labels}
        bills={bills.map((bill) => {
          const consumptionM3 = toNumber(bill.consumptionM3);
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
            totalToPay: bill.totalToPay ? bill.totalToPay.toString() : null,
            consumptionLabel: consumptionM3
              ? `${consumptionM3} ${labels.units.m3}`
              : consumptionKwh
                ? `${consumptionKwh} ${labels.units.kwh}`
                : null,
            consumptionKwh,
            consumptionM3,
            pdfUrl: bill.pdfUrl ?? null,
            href: `/homes/${home.id}/gas/${bill.id}`,
          };
        })}
      />
    </PageShell>
  );
}
