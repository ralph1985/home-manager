import { notFound } from "next/navigation";

import BillSummary from "@/components/billing/BillSummary";
import ContractPanel from "@/components/billing/ContractPanel";
import CostBreakdown from "@/components/billing/CostBreakdown";
import { formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getWaterBillById } from "@/infrastructure/waterRepository";

export const runtime = "nodejs";

type WaterBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

export default async function WaterBillPage({ params }: WaterBillPageProps) {
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await getWaterBillById(homeId, billId);

  if (!bill) {
    notFound();
  }

  const periodLabel =
    bill.periodStart && bill.periodEnd
      ? `${formatDate(bill.periodStart)} - ${formatDate(bill.periodEnd)}`
      : formatDate(bill.issueDate);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Factura de agua"
        title={bill.invoiceNumber ?? "Factura"}
        description={periodLabel}
        actionLabel="Volver al listado"
        actionHref={`/homes/${homeId}/water`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <BillSummary
          title="Resumen"
          providerName={bill.provider?.name}
          totalAmount={bill.totalAmount}
          consumptionLabel={bill.consumptionM3 ? `${bill.consumptionM3} m³` : undefined}
          issueDate={bill.issueDate}
          paymentDate={bill.paymentDate}
          pdfUrl={bill.pdfUrl}
          extraRows={bill.status ? [{ label: "Estado", value: bill.status }] : undefined}
        />
        <ContractPanel
          title="Contrato"
          rows={[
            { label: "Contrato", value: bill.supplyPoint?.contractNumber ?? "-" },
            { label: "Contador", value: bill.supplyPoint?.meterNumber ?? "-" },
            { label: "Uso", value: bill.supplyPoint?.usage ?? "-" },
            { label: "Tipo suministro", value: bill.supplyPoint?.supplyType ?? "-" },
          ]}
        />
      </section>

      <CostBreakdown
        title="Desglose"
        emptyMessage="No hay lineas de coste asociadas."
        lines={bill.costLines.map((line) => ({
          id: line.id,
          label: line.category?.name ?? "Categoria",
          amount: line.amount,
        }))}
      />
    </PageShell>
  );
}
