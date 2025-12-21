import { notFound } from "next/navigation";

import BillSummary from "@/components/billing/BillSummary";
import ContractPanel from "@/components/billing/ContractPanel";
import CostBreakdown from "@/components/billing/CostBreakdown";
import { formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getEnergyBillById } from "@/infrastructure/energyRepository";

export const runtime = "nodejs";

type EnergyBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

export default async function EnergyBillPage({ params }: EnergyBillPageProps) {
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await getEnergyBillById(homeId, billId);

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
        eyebrow="Factura de luz"
        title={bill.invoiceNumber ?? "Factura"}
        description={periodLabel}
        actionLabel="Volver al listado"
        actionHref={`/homes/${homeId}/energy`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <BillSummary
          title="Resumen"
          providerName={bill.provider?.name}
          totalAmount={bill.totalAmount}
          consumptionLabel={`${bill.consumptionKwh} kWh`}
          issueDate={bill.issueDate}
          paymentDate={bill.paymentDate}
          pdfUrl={bill.pdfUrl}
        />
        <ContractPanel
          title="Contrato"
          rows={[
            { label: "Tarifa", value: bill.tariff ?? "-" },
            { label: "Contrato", value: bill.contractNumber ?? "-" },
            ...(bill.supplyPoint
              ? [
                  { label: "CUPS", value: bill.supplyPoint.cups },
                  {
                    label: "Distribuidora",
                    value: bill.supplyPoint.distributor ?? "-",
                  },
                  { label: "Peaje", value: bill.supplyPoint.gridToll ?? "-" },
                ]
              : []),
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
