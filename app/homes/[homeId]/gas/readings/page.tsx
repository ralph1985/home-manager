import { notFound, redirect } from "next/navigation";

import GasReadingsManager from "@/components/gas/GasReadingsManager";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLocale, getServerLabels } from "@/infrastructure/ui/labels/server";
import { getHomeUseCase } from "@/usecases/homes";
import {
  createGasReadingUseCase,
  deleteGasReadingUseCase,
  listGasReadingsUseCase,
  listGasSupplyPointsUseCase,
  updateGasReadingUseCase,
} from "@/usecases/gasReadings";
import { listGasBillsUseCase } from "@/usecases/gasBills";

export const runtime = "nodejs";

type GasReadingsPageProps = {
  params: Promise<{ homeId: string }>;
};

const parseNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return null;
  if (value.trim() === "") return null;
  const normalized = value.replace(",", ".");
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const parseDateValue = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseBillSelection = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return { autoLink: true, billId: null as number | null };
  }
  if (value === "auto" || value.trim() === "") {
    return { autoLink: true, billId: null as number | null };
  }
  if (value === "none") {
    return { autoLink: false, billId: null as number | null };
  }
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? { autoLink: false, billId: parsed }
    : { autoLink: true, billId: null as number | null };
};

export default async function GasReadingsPage({ params }: GasReadingsPageProps) {
  const labels = await getServerLabels();
  const locale = await getServerLocale();
  const { homeId: rawHomeId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);

  if (Number.isNaN(homeId)) {
    notFound();
  }

  const home = await getHomeUseCase(homeId);

  if (!home) {
    notFound();
  }

  const [readings, supplyPoints] = await Promise.all([
    listGasReadingsUseCase(homeId),
    listGasSupplyPointsUseCase(homeId),
  ]);
  const bills = await listGasBillsUseCase(homeId);
  const billOptions = bills.map((bill) => {
    const periodLabel =
      bill.periodStart && bill.periodEnd
        ? `${bill.periodStart.toISOString().slice(0, 10)} - ${bill.periodEnd
            .toISOString()
            .slice(0, 10)}`
        : bill.issueDate.toISOString().slice(0, 10);
    const invoiceLabel = bill.invoiceNumber ? `#${bill.invoiceNumber}` : `#${bill.id}`;
    return {
      id: bill.id,
      label: `${invoiceLabel} · ${periodLabel}`,
    };
  });

  const accumulatedByReadingId = (() => {
    const readingsByBill = new Map<number, { id: number; date: number; value: number }[]>();
    const readingValues = new Map<number, { date: number; value: number; billId: number | null }>();

    readings.forEach((reading) => {
      const value = Number(reading.readingM3.toString());
      if (!Number.isFinite(value)) return;
      const date = reading.readingDate.getTime();
      readingValues.set(reading.id, { date, value, billId: reading.billId ?? null });
      if (!reading.billId) return;
      const list = readingsByBill.get(reading.billId) ?? [];
      list.push({ id: reading.id, date, value });
      readingsByBill.set(reading.billId, list);
    });

    const billOrder = [...bills]
      .map((bill) => ({
        id: bill.id,
        end: (bill.periodEnd ?? bill.issueDate).getTime(),
      }))
      .sort((a, b) => a.end - b.end);

    const lastReadingByBill = new Map<number, number>();
    readingsByBill.forEach((items, billId) => {
      const latest = items.reduce((acc, item) => (item.date > acc.date ? item : acc), items[0]);
      lastReadingByBill.set(billId, latest.value);
    });

    const previousBillByBill = new Map<number, number | null>();
    billOrder.forEach((bill, index) => {
      const prevBill = billOrder[index - 1];
      previousBillByBill.set(bill.id, prevBill ? prevBill.id : null);
    });

    const findPreviousBillIdByDate = (date: number) => {
      let prev: number | null = null;
      for (const bill of billOrder) {
        if (bill.end < date) {
          prev = bill.id;
          continue;
        }
        break;
      }
      return prev;
    };

    const accumulated = new Map<number, { value: number; hasBase: boolean }>();
    readingValues.forEach((reading, readingId) => {
      const baseBillId = reading.billId
        ? (previousBillByBill.get(reading.billId) ?? null)
        : findPreviousBillIdByDate(reading.date);
      const baseValue = baseBillId ? (lastReadingByBill.get(baseBillId) ?? null) : null;
      if (baseValue == null) {
        accumulated.set(readingId, { value: 0, hasBase: false });
        return;
      }
      accumulated.set(readingId, {
        value: Number((reading.value - baseValue).toFixed(3)),
        hasBase: true,
      });
    });

    return accumulated;
  })();

  const summary = (() => {
    if (readings.length < 2) return null;
    const sorted = [...readings].sort((a, b) => a.readingDate.getTime() - b.readingDate.getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return null;
    const firstValue = Number(first.readingM3.toString());
    const lastValue = Number(last.readingM3.toString());
    if (!Number.isFinite(firstValue) || !Number.isFinite(lastValue)) return null;
    const usedValue = Number((lastValue - firstValue).toFixed(3));
    return {
      startValue: first.readingM3.toString(),
      startDate: first.readingDate.toISOString(),
      latestValue: last.readingM3.toString(),
      latestDate: last.readingDate.toISOString(),
      usedValue: usedValue.toString(),
    };
  })();

  async function createReading(formData: FormData) {
    "use server";

    const readingDate = parseDateValue(formData.get("readingDate"));
    const readingM3 = parseNumber(formData.get("readingM3"));
    const notes = formData.get("notes");
    const supplyPointId = parseNumber(formData.get("supplyPointId"));
    const billSelection = parseBillSelection(formData.get("billId"));

    if (!readingDate || readingM3 == null) {
      redirect(`/homes/${homeId}/gas/readings`);
    }

    await createGasReadingUseCase({
      homeId,
      readingDate,
      readingM3,
      notes: typeof notes === "string" ? notes.trim() : null,
      supplyPointId: supplyPointId ?? null,
      billId: billSelection.billId,
      autoLink: billSelection.autoLink,
    });

    redirect(`/homes/${homeId}/gas/readings`);
  }

  async function updateReading(formData: FormData) {
    "use server";

    const readingId = parseNumber(formData.get("readingId"));
    const readingDate = parseDateValue(formData.get("readingDate"));
    const readingM3 = parseNumber(formData.get("readingM3"));
    const notes = formData.get("notes");
    const supplyPointId = parseNumber(formData.get("supplyPointId"));
    const billSelection = parseBillSelection(formData.get("billId"));

    if (!readingDate || readingM3 == null || readingId == null) {
      redirect(`/homes/${homeId}/gas/readings`);
    }

    await updateGasReadingUseCase(readingId, {
      homeId,
      readingDate,
      readingM3,
      notes: typeof notes === "string" ? notes.trim() : null,
      supplyPointId: supplyPointId ?? null,
      billId: billSelection.billId,
      autoLink: billSelection.autoLink,
    });

    redirect(`/homes/${homeId}/gas/readings`);
  }

  async function deleteReading(formData: FormData) {
    "use server";

    const readingId = parseNumber(formData.get("readingId"));
    if (readingId == null) {
      redirect(`/homes/${homeId}/gas/readings`);
    }

    await deleteGasReadingUseCase(homeId, readingId);
    redirect(`/homes/${homeId}/gas/readings`);
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gasReadings.eyebrow}
        title={`${labels.gasReadings.titlePrefix} ${home.name}`}
        description={labels.gasReadings.description}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${home.id}/gas`}
      />

      <GasReadingsManager
        labels={labels}
        locale={locale}
        readings={readings.map((reading) => {
          const acc = accumulatedByReadingId.get(reading.id);
          return {
            id: reading.id,
            readingDate: reading.readingDate.toISOString(),
            readingM3: reading.readingM3.toString(),
            accumulatedM3: acc?.hasBase ? acc.value : null,
            accumulatedMissing: acc ? !acc.hasBase : false,
            notes: reading.notes,
            supplyPointLabel: reading.supplyPoint?.cups ?? reading.supplyPoint?.addressLine ?? null,
            supplyPointId: reading.supplyPointId ?? null,
            billId: reading.billId ?? null,
            billLabel: reading.bill?.invoiceNumber ?? null,
            billPeriodStart: reading.bill?.periodStart?.toISOString() ?? null,
            billPeriodEnd: reading.bill?.periodEnd?.toISOString() ?? null,
            billIssueDate: reading.bill?.issueDate?.toISOString() ?? null,
            billReadingM3: reading.bill?.readingCurrM3?.toString() ?? null,
            billUsageM3: reading.bill?.consumptionM3?.toString() ?? null,
            billHref: reading.billId ? `/homes/${home.id}/gas/${reading.billId}` : null,
          };
        })}
        supplyPoints={supplyPoints.map((point) => ({
          id: point.id,
          label: point.cups ?? point.addressLine ?? `#${point.id}`,
        }))}
        bills={billOptions}
        summary={summary}
        onCreate={createReading}
        onUpdate={updateReading}
        onDelete={deleteReading}
      />
    </PageShell>
  );
}
