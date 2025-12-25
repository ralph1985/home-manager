import { notFound } from "next/navigation";

import WaterBillsTable from "@/components/billing/WaterBillsTable";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getHomeUseCase } from "@/usecases/homes";
import { listWaterBillsUseCase } from "@/usecases/waterBills";

export const runtime = "nodejs";

type WaterPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function WaterPage({ params }: WaterPageProps) {
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

  const bills = await listWaterBillsUseCase(homeId);
  const toNumber = (value?: { toString(): string } | null) =>
    value == null ? null : Number(value.toString());

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.water.eyebrow}
        title={`${labels.water.titlePrefix} ${home.name}`}
        description={labels.water.description}
        actionLabel={labels.common.backToPanel}
        actionHref={`/homes/${home.id}`}
      />
      <WaterBillsTable
        title={labels.water.listTitle}
        emptyMessage={labels.water.emptyList}
        labels={labels}
        bills={bills.map((bill) => {
          const consumptionM3 = toNumber(bill.consumptionM3);
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
            consumptionLabel: consumptionM3 ? `${consumptionM3} ${labels.units.m3}` : null,
            consumptionM3,
            billType: bill.billType ?? null,
            cancelsInvoiceNumber: bill.cancelsInvoiceNumber ?? null,
            cancelsHref: bill.cancelsBillId
              ? `/homes/${home.id}/water/${bill.cancelsBillId}`
              : null,
            pdfUrl: bill.pdfUrl ?? null,
            href: `/homes/${home.id}/water/${bill.id}`,
          };
        })}
      />
    </PageShell>
  );
}
