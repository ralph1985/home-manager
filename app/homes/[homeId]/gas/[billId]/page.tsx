import { notFound } from "next/navigation";

import BillSummary from "@/components/billing/BillSummary";
import ContractPanel from "@/components/billing/ContractPanel";
import CostBreakdown from "@/components/billing/CostBreakdown";
import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getGasBillUseCase } from "@/usecases/gasBills";

export const runtime = "nodejs";

type GasBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

function formatReading(
  labels: Awaited<ReturnType<typeof getServerLabels>>,
  value?: number | null,
  date?: Date | null,
  type?: string | null
) {
  if (value == null) return null;
  const parts = [`${value} ${labels.units.m3}`];
  if (date) {
    parts.push(formatDate(date));
  }
  if (type) {
    parts.push(type);
  }
  return parts.join(" · ");
}

export default async function GasBillPage({ params }: GasBillPageProps) {
  const labels = await getServerLabels();
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await getGasBillUseCase(homeId, billId);

  if (!bill) {
    notFound();
  }

  const periodLabel =
    bill.periodStart && bill.periodEnd
      ? `${formatDate(bill.periodStart)} - ${formatDate(bill.periodEnd)}`
      : formatDate(bill.issueDate);

  const readingPrev = formatReading(
    labels,
    bill.readingPrevM3?.toNumber(),
    bill.readingPrevDate,
    bill.readingPrevType
  );
  const readingCurr = formatReading(
    labels,
    bill.readingCurrM3?.toNumber(),
    bill.readingCurrDate,
    bill.readingCurrType
  );

  const extraRows: Array<{ label: string; value: string }> = [];
  if (bill.totalToPay != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.totalToPay,
      value: formatCurrency(bill.totalToPay),
    });
  }
  if (bill.mandateReference) {
    extraRows.push({
      label: labels.gasBill.extraLabels.mandateReference,
      value: bill.mandateReference,
    });
  }
  if (bill.conversionFactor != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.conversionFactor,
      value: `${bill.conversionFactor} kWh/${labels.units.m3}`,
    });
  }
  if (bill.supplyPressureBar != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.supplyPressure,
      value: `${bill.supplyPressureBar} bar`,
    });
  }
  if (bill.peajesAmount != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.peajes,
      value: formatCurrency(bill.peajesAmount),
    });
  }
  if (bill.cargosAmount != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.cargos,
      value: formatCurrency(bill.cargosAmount),
    });
  }
  if (bill.cnmcPercent != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.cnmc,
      value: `${bill.cnmcPercent}%`,
    });
  }
  if (bill.gtsPercent != null) {
    extraRows.push({
      label: labels.gasBill.extraLabels.gts,
      value: `${bill.gtsPercent}%`,
    });
  }
  if (readingPrev) {
    extraRows.push({
      label: labels.gasBill.extraLabels.readingPrev,
      value: readingPrev,
    });
  }
  if (readingCurr) {
    extraRows.push({
      label: labels.gasBill.extraLabels.readingCurr,
      value: readingCurr,
    });
  }

  const consumptionLabel = bill.consumptionKwh
    ? `${bill.consumptionKwh} ${labels.units.kwh}${
        bill.consumptionM3 ? ` (${bill.consumptionM3} ${labels.units.m3})` : ""
      }`
    : bill.consumptionM3
      ? `${bill.consumptionM3} ${labels.units.m3}`
      : undefined;

  const supplyPoint = bill.supplyPoint;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gasBill.eyebrow}
        title={bill.invoiceNumber ?? labels.gasBill.fallbackTitle}
        description={periodLabel}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${homeId}/gas`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <BillSummary
          title={labels.gasBill.summaryTitle}
          providerName={bill.provider?.name}
          totalAmount={bill.totalAmount}
          consumptionLabel={consumptionLabel}
          issueDate={bill.issueDate}
          paymentDate={bill.chargeDate}
          pdfUrl={bill.pdfUrl}
          extraRows={extraRows.length ? extraRows : undefined}
        />
        <ContractPanel
          title={labels.gasBill.contractTitle}
          rows={[
            {
              label: labels.gasBill.contractLabels.accessTariff,
              value: bill.accessTariff ?? supplyPoint?.accessTariff ?? labels.common.emptyValue,
            },
            {
              label: labels.gasBill.contractLabels.commercialTariff,
              value:
                bill.commercialTariff ?? supplyPoint?.commercialTariff ?? labels.common.emptyValue,
            },
            {
              label: labels.gasBill.contractLabels.contract,
              value: bill.contractNumber ?? supplyPoint?.contractNumber ?? labels.common.emptyValue,
            },
            {
              label: labels.gasBill.contractLabels.cups,
              value: supplyPoint?.cups ?? labels.common.emptyValue,
            },
            {
              label: labels.gasBill.contractLabels.meter,
              value: bill.meterNumber ?? supplyPoint?.meterNumber ?? labels.common.emptyValue,
            },
            {
              label: labels.gasBill.contractLabels.address,
              value: supplyPoint?.addressLine ?? labels.common.emptyValue,
            },
          ]}
        />
      </section>

      <CostBreakdown
        title={labels.gasBill.costTitle}
        emptyMessage={labels.gasBill.costEmpty}
        lines={bill.costLines.map((line) => ({
          id: line.id,
          label: line.category?.name ?? labels.gasBill.costCategoryFallback,
          amount: line.amount,
        }))}
      />
    </PageShell>
  );
}
