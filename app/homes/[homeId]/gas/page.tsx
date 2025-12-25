import { notFound } from "next/navigation";

import BillsList from "@/components/billing/BillsList";
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

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gas.eyebrow}
        title={`${labels.gas.titlePrefix} ${home.name}`}
        description={labels.gas.description}
        actionLabel={labels.common.backToPanel}
        actionHref={`/homes/${home.id}`}
      />
      <BillsList
        title={labels.gas.listTitle}
        emptyMessage={labels.gas.emptyList}
        bills={bills.map((bill) => ({
          id: bill.id,
          providerName: bill.provider?.name,
          invoiceNumber: bill.invoiceNumber,
          issueDate: bill.issueDate,
          periodStart: bill.periodStart ?? undefined,
          periodEnd: bill.periodEnd ?? undefined,
          totalAmount: bill.totalAmount,
          totalToPay: bill.totalToPay,
          consumptionLabel: bill.consumptionM3
            ? `${bill.consumptionM3} ${labels.units.m3}`
            : bill.consumptionKwh
              ? `${bill.consumptionKwh} ${labels.units.kwh}`
              : undefined,
          pdfUrl: bill.pdfUrl,
        }))}
        detailHref={(billId) => `/homes/${home.id}/gas/${billId}`}
      />
    </PageShell>
  );
}
