import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import BillSummary from "@/components/billing/BillSummary";
import ContractPanel from "@/components/billing/ContractPanel";
import CostBreakdown from "@/components/billing/CostBreakdown";
import { billTypeBadgeClass, formatBillType } from "@/components/billing/billTypeFormatters";
import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getWaterBillUseCase } from "@/usecases/waterBills";

export const runtime = "nodejs";

type WaterBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

export default async function WaterBillPage({ params }: WaterBillPageProps) {
  const labels = await getServerLabels();
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await getWaterBillUseCase(homeId, billId);

  if (!bill) {
    notFound();
  }

  const periodLabel =
    bill.periodStart && bill.periodEnd
      ? `${formatDate(bill.periodStart)} - ${formatDate(bill.periodEnd)}`
      : formatDate(bill.issueDate);

  const extraRows: Array<{ label: string; value: ReactNode }> = [
    { label: labels.waterBill.extraLabels.type, value: bill.billType ?? labels.common.emptyValue },
    ...(bill.status ? [{ label: labels.waterBill.extraLabels.status, value: bill.status }] : []),
    ...(bill.totalToPay != null
      ? [
          {
            label: labels.waterBill.extraLabels.totalToPay,
            value: formatCurrency(bill.totalToPay),
          },
        ]
      : []),
  ];

  if (bill.cancelsBill) {
    extraRows.push({
      label: labels.waterBill.extraLabels.cancels,
      value: (
        <Link
          className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
          href={`/homes/${homeId}/water/${bill.cancelsBill.id}`}
        >
          #{bill.cancelsBill.invoiceNumber ?? bill.cancelsBill.id}
        </Link>
      ),
    });
  } else if (bill.cancelsInvoiceNumber) {
    extraRows.push({
      label: labels.waterBill.extraLabels.cancels,
      value: `#${bill.cancelsInvoiceNumber}`,
    });
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.waterBill.eyebrow}
        title={bill.invoiceNumber ?? labels.waterBill.fallbackTitle}
        titleBadge={
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${billTypeBadgeClass(
              bill.billType
            )}`}
          >
            {formatBillType(bill.billType, labels)}
          </span>
        }
        description={periodLabel}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${homeId}/water`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <BillSummary
          title={labels.waterBill.summaryTitle}
          providerName={bill.provider?.name}
          totalAmount={bill.totalAmount}
          consumptionLabel={
            bill.consumptionM3 ? `${bill.consumptionM3} ${labels.units.m3}` : undefined
          }
          issueDate={bill.issueDate}
          paymentDate={bill.paymentDate}
          pdfUrl={bill.pdfUrl}
          extraRows={extraRows}
        />
        <ContractPanel
          title={labels.waterBill.contractTitle}
          rows={[
            {
              label: labels.waterBill.contractLabels.contract,
              value: bill.supplyPoint?.contractNumber ?? labels.common.emptyValue,
            },
            {
              label: labels.waterBill.contractLabels.meter,
              value: bill.supplyPoint?.meterNumber ?? labels.common.emptyValue,
            },
            {
              label: labels.waterBill.contractLabels.usage,
              value: bill.supplyPoint?.usage ?? labels.common.emptyValue,
            },
            {
              label: labels.waterBill.contractLabels.supplyType,
              value: bill.supplyPoint?.supplyType ?? labels.common.emptyValue,
            },
          ]}
        />
      </section>

      <CostBreakdown
        title={labels.waterBill.costTitle}
        emptyMessage={labels.waterBill.costEmpty}
        lines={bill.costLines.map((line) => ({
          id: line.id,
          label: line.category?.name ?? labels.waterBill.costCategoryFallback,
          amount: line.amount,
        }))}
      />
    </PageShell>
  );
}
