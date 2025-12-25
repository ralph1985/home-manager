import { notFound } from "next/navigation";

import BillSummary from "@/components/billing/BillSummary";
import ContractPanel from "@/components/billing/ContractPanel";
import CostBreakdown from "@/components/billing/CostBreakdown";
import { formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getEnergyBillUseCase } from "@/usecases/energyBills";

export const runtime = "nodejs";

type EnergyBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

export default async function EnergyBillPage({ params }: EnergyBillPageProps) {
  const labels = await getServerLabels();
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await getEnergyBillUseCase(homeId, billId);

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
        eyebrow={labels.energyBill.eyebrow}
        title={bill.invoiceNumber ?? labels.energyBill.fallbackTitle}
        description={periodLabel}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${homeId}/energy`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <BillSummary
          title={labels.energyBill.summaryTitle}
          providerName={bill.provider?.name}
          totalAmount={bill.totalAmount}
          consumptionLabel={`${bill.consumptionKwh} ${labels.units.kwh}`}
          issueDate={bill.issueDate}
          paymentDate={bill.paymentDate}
          pdfUrl={bill.pdfUrl}
        />
        <ContractPanel
          title={labels.energyBill.contractTitle}
          rows={[
            {
              label: labels.energyBill.contractLabels.tariff,
              value: bill.tariff ?? labels.common.emptyValue,
            },
            {
              label: labels.energyBill.contractLabels.contract,
              value: bill.contractNumber ?? labels.common.emptyValue,
            },
            ...(bill.supplyPoint
              ? [
                  { label: labels.energyBill.contractLabels.cups, value: bill.supplyPoint.cups },
                  {
                    label: labels.energyBill.contractLabels.distributor,
                    value: bill.supplyPoint.distributor ?? labels.common.emptyValue,
                  },
                  {
                    label: labels.energyBill.contractLabels.gridToll,
                    value: bill.supplyPoint.gridToll ?? labels.common.emptyValue,
                  },
                ]
              : []),
          ]}
        />
      </section>

      <CostBreakdown
        title={labels.energyBill.costTitle}
        emptyMessage={labels.energyBill.costEmpty}
        lines={bill.costLines.map((line) => ({
          id: line.id,
          label: line.category?.name ?? labels.energyBill.costCategoryFallback,
          amount: line.amount,
        }))}
      />
    </PageShell>
  );
}
