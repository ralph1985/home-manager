import { notFound } from "next/navigation";

import BillsList from "@/components/billing/BillsList";
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

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.energy.eyebrow}
        title={`${labels.energy.titlePrefix} ${home.name}`}
        description={labels.energy.description}
        actionLabel={labels.common.backToPanel}
        actionHref={`/homes/${home.id}`}
      />
      <BillsList
        title={labels.energy.listTitle}
        emptyMessage={labels.energy.emptyList}
        bills={bills.map((bill) => ({
          id: bill.id,
          providerName: bill.provider?.name,
          invoiceNumber: bill.invoiceNumber,
          issueDate: bill.issueDate,
          periodStart: bill.periodStart ?? undefined,
          periodEnd: bill.periodEnd ?? undefined,
          totalAmount: bill.totalAmount,
          consumptionLabel: `${bill.consumptionKwh} ${labels.units.kwh}`,
          pdfUrl: bill.pdfUrl,
        }))}
        detailHref={(billId) => `/homes/${home.id}/energy/${billId}`}
      />
    </PageShell>
  );
}
