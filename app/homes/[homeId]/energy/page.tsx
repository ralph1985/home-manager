import { notFound } from "next/navigation";

import BillsList from "@/components/billing/BillsList";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { listEnergyBillsUseCase } from "@/usecases/energyBills";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

type EnergyPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function EnergyPage({ params }: EnergyPageProps) {
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
        eyebrow="Luz"
        title={`Facturas de ${home.name}`}
        description="Revisa los importes y periodos de facturacion de electricidad."
        actionLabel="Volver al panel"
        actionHref={`/homes/${home.id}`}
      />
      <BillsList
        title="Listado de facturas"
        emptyMessage="Todavia no hay facturas registradas."
        bills={bills.map((bill) => ({
          id: bill.id,
          providerName: bill.provider?.name,
          invoiceNumber: bill.invoiceNumber,
          issueDate: bill.issueDate,
          periodStart: bill.periodStart ?? undefined,
          periodEnd: bill.periodEnd ?? undefined,
          totalAmount: bill.totalAmount,
          consumptionLabel: `${bill.consumptionKwh} kWh`,
        }))}
        detailHref={(billId) => `/homes/${home.id}/energy/${billId}`}
      />
    </PageShell>
  );
}
