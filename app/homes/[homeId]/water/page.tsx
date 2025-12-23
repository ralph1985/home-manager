import { notFound } from "next/navigation";

import BillsList from "@/components/billing/BillsList";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getHomeUseCase } from "@/usecases/homes";
import { listWaterBillsUseCase } from "@/usecases/waterBills";

export const runtime = "nodejs";

type WaterPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function WaterPage({ params }: WaterPageProps) {
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

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Agua"
        title={`Facturas de ${home.name}`}
        description="Revisa los importes y periodos de facturacion de agua."
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
          totalToPay: bill.totalToPay,
          consumptionLabel: bill.consumptionM3 ? `${bill.consumptionM3} m³` : undefined,
          billType: bill.billType,
          cancelsInvoiceNumber: bill.cancelsInvoiceNumber ?? undefined,
          cancelsBillId: bill.cancelsBillId ?? undefined,
        }))}
        detailHref={(billId) => `/homes/${home.id}/water/${billId}`}
      />
    </PageShell>
  );
}
