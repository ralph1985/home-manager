"use client";

import { useMemo, useState } from "react";

import Button from "@/components/Button";
import type { Labels } from "@/infrastructure/ui/labels";

type GasReadingRow = {
  id: number;
  readingDate: string;
  readingM3: string;
  accumulatedM3?: number | null;
  accumulatedMissing?: boolean;
  notes?: string | null;
  supplyPointLabel?: string | null;
  supplyPointId?: number | null;
  billId?: number | null;
  billLabel?: string | null;
  billPeriodStart?: string | null;
  billPeriodEnd?: string | null;
  billIssueDate?: string | null;
  billHref?: string | null;
  billReadingM3?: string | null;
  billUsageM3?: string | null;
};

type SupplyPointOption = {
  id: number;
  label: string;
};

type BillOption = {
  id: number;
  label: string;
};

type GasReadingsManagerProps = {
  labels: Labels;
  locale: string;
  readings: GasReadingRow[];
  supplyPoints: SupplyPointOption[];
  bills: BillOption[];
  summary?: {
    startValue: string;
    startDate: string;
    latestValue: string;
    latestDate: string;
    usedValue: string;
  } | null;
  onCreate: (formData: FormData) => void | Promise<void>;
  onUpdate: (formData: FormData) => void | Promise<void>;
  onDelete: (formData: FormData) => void | Promise<void>;
};

const formatDateLabel = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
  }).format(date);
};

const formatInteger = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export default function GasReadingsManager({
  labels,
  locale,
  readings,
  supplyPoints,
  bills,
  summary,
  onCreate,
  onUpdate,
  onDelete,
}: GasReadingsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<GasReadingRow | null>(null);

  const sortedReadings = useMemo(() => {
    return [...readings].sort(
      (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
    );
  }, [readings]);

  const groupedRows = useMemo(() => {
    const rows: Array<
      | {
          type: "group";
          id: string;
          key: string;
          label: string;
          href?: string | null;
          period?: { start?: string | null; end?: string | null };
          billReadingM3?: string | null;
          billUsageM3?: string | null;
        }
      | { type: "reading"; row: GasReadingRow; groupId: string }
    > = [];
    let lastGroupId: string | null = null;
    let groupIndex = 0;

    sortedReadings.forEach((reading) => {
      const groupId = reading.billId ? `bill-${reading.billId}` : "no-bill";
      if (groupId !== lastGroupId) {
        rows.push({
          type: "group",
          id: groupId,
          key: `${groupId}-${groupIndex}`,
          label:
            reading.billLabel ??
            (reading.billPeriodStart && reading.billPeriodEnd
              ? `${formatDateLabel(reading.billPeriodStart, locale)} - ${formatDateLabel(
                  reading.billPeriodEnd,
                  locale
                )}`
              : null) ??
            labels.gasReadings.groupNoBill,
          href: reading.billHref ?? null,
          period: {
            start: reading.billPeriodStart ?? null,
            end: reading.billPeriodEnd ?? null,
          },
          billReadingM3: reading.billReadingM3 ?? null,
          billUsageM3: reading.billUsageM3 ?? null,
        });
        lastGroupId = groupId;
        groupIndex += 1;
      }
      rows.push({ type: "reading", row: reading, groupId });
    });

    return rows;
  }, [sortedReadings, labels.gasReadings.groupNoBill, locale]);

  const readingBaseClassName = "bg-[color:var(--surface, #ffffff)]";

  const openCreate = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const openEdit = (reading: GasReadingRow) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(labels.gasReadings.deleteConfirm)) {
      event.preventDefault();
    }
  };

  const modalTitle = editingReading
    ? labels.gasReadings.formTitleEdit
    : labels.gasReadings.formTitleNew;
  const submitLabel = editingReading ? labels.gasReadings.formSave : labels.gasReadings.formSave;
  const headerClassName = summary
    ? "mt-6 flex flex-wrap items-center justify-between gap-4"
    : "flex flex-wrap items-center justify-between gap-4";

  return (
    <section className="mt-8">
      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="hm-panel p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {labels.gasReadings.summary.start}
            </div>
            <div className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
              {summary.startValue} {labels.units.m3}
            </div>
            <div className="mt-1 text-xs text-[color:var(--text-subtle)]">
              {formatDateLabel(summary.startDate, locale)}
            </div>
          </div>
          <div className="hm-panel p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {labels.gasReadings.summary.latest}
            </div>
            <div className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
              {summary.latestValue} {labels.units.m3}
            </div>
            <div className="mt-1 text-xs text-[color:var(--text-subtle)]">
              {formatDateLabel(summary.latestDate, locale)}
            </div>
          </div>
          <div className="hm-panel p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              {labels.gasReadings.summary.used}
            </div>
            <div className="mt-2 text-xl font-semibold text-[color:var(--text-strong)]">
              {summary.usedValue} {labels.units.m3}
            </div>
            <div className="mt-1 text-xs text-[color:var(--text-subtle)]">
              {labels.gasReadings.summary.fromTo
                .replace("{from}", formatDateLabel(summary.startDate, locale))
                .replace("{to}", formatDateLabel(summary.latestDate, locale))}
            </div>
          </div>
        </div>
      ) : null}

      <div className={headerClassName}>
        <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">
          {labels.gasReadings.listTitle}
        </h2>
        <Button
          size="sm"
          variant="primary"
          loadingLabel={labels.button.loading}
          onClick={openCreate}
        >
          {labels.gasReadings.addAction}
        </Button>
      </div>

      {sortedReadings.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-[color:var(--text-muted)]">
          {labels.gasReadings.empty}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)]">
          <table className="min-w-[720px] w-full text-left text-sm text-[color:var(--text-default)]">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
              <tr>
                <th className="px-4 py-3 font-semibold">{labels.gasReadings.columns.date}</th>
                <th className="px-4 py-3 font-semibold">{labels.gasReadings.columns.reading}</th>
                <th className="px-4 py-3 font-semibold">
                  {labels.gasReadings.columns.accumulated}
                </th>
                <th className="px-4 py-3 font-semibold">{labels.gasReadings.columns.notes}</th>
                <th className="px-4 py-3 font-semibold">{labels.gasReadings.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((item) =>
                item.type === "group" ? (
                  <tr key={item.key}>
                    <td className="px-4 py-4" colSpan={5}>
                      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[var(--surface-border)] bg-[color:var(--surface-muted)] px-4 py-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                            {labels.gasReadings.groupTitle}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[color:var(--text-strong)]">
                            {item.href ? (
                              <a className="underline-offset-4 hover:underline" href={item.href}>
                                {labels.gasReadings.groupLabel.replace("{bill}", item.label)}
                              </a>
                            ) : (
                              labels.gasReadings.groupLabel.replace("{bill}", item.label)
                            )}
                          </div>
                          {item.period?.start && item.period.end ? (
                            <div className="mt-1 text-xs text-[color:var(--text-faint)]">
                              {formatDateLabel(item.period.start, locale)} -{" "}
                              {formatDateLabel(item.period.end, locale)}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-faint)]">
                          {item.billReadingM3 ? (
                            <span className="rounded-full border border-[var(--surface-border)] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                              {labels.gasReadings.billReadingLabel.replace(
                                "{value}",
                                item.billReadingM3
                              )}{" "}
                              {labels.units.m3}
                            </span>
                          ) : null}
                          {item.billUsageM3 ? (
                            <span className="rounded-full border border-[var(--surface-border)] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                              {labels.gasReadings.billUsageLabel.replace(
                                "{value}",
                                item.billUsageM3
                              )}{" "}
                              {labels.units.m3}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.row.id} className={readingBaseClassName}>
                    <td className="px-4 py-3 font-semibold text-[color:var(--text-strong)]">
                      {formatDateLabel(item.row.readingDate, locale)}
                    </td>
                    <td className="px-4 py-3">
                      {item.row.readingM3} {labels.units.m3}
                    </td>
                    <td className="px-4 py-3">
                      {item.row.accumulatedM3 != null ? (
                        <div className="text-base font-semibold text-[color:var(--text-strong)]">
                          {formatInteger(item.row.accumulatedM3, locale)} {labels.units.m3}
                        </div>
                      ) : item.row.accumulatedMissing ? (
                        <div className="text-xs text-[color:var(--text-faint)]">
                          {labels.gasReadings.accumulatedMissing}
                        </div>
                      ) : (
                        <div className="text-xs text-[color:var(--text-faint)]">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--text-muted)]">
                      {item.row.notes ?? labels.common.emptyValue}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          loadingLabel={labels.button.loading}
                          onClick={() => openEdit(item.row)}
                        >
                          {labels.gasReadings.editAction}
                        </Button>
                        <form action={onDelete} onSubmit={handleDeleteSubmit}>
                          <input type="hidden" name="readingId" value={item.row.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="ghost"
                            loadingLabel={labels.button.loading}
                          >
                            {labels.gasReadings.deleteAction}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="hm-panel w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[color:var(--text-strong)]">
                  {modalTitle}
                </div>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  {labels.gasReadings.formDescription}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-[color:var(--text-subtle)]"
                onClick={handleClose}
              >
                {labels.gasReadings.formCancel}
              </button>
            </div>

            <form className="mt-4 space-y-4" action={editingReading ? onUpdate : onCreate}>
              {editingReading ? (
                <input type="hidden" name="readingId" value={editingReading.id} />
              ) : null}
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                <span>{labels.gasReadings.formDateLabel}</span>
                <input
                  className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                  type="date"
                  name="readingDate"
                  defaultValue={
                    editingReading
                      ? editingReading.readingDate.slice(0, 10)
                      : new Date().toISOString().slice(0, 10)
                  }
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                <span>{labels.gasReadings.formReadingLabel}</span>
                <input
                  className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                  type="number"
                  name="readingM3"
                  min={0}
                  step="0.001"
                  defaultValue={editingReading?.readingM3 ?? ""}
                  required
                />
              </label>
              {supplyPoints.length > 1 ? (
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  <span>{labels.gasReadings.formSupplyPointLabel}</span>
                  <select
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                    name="supplyPointId"
                    defaultValue={editingReading?.supplyPointId ?? supplyPoints[0]?.id ?? undefined}
                  >
                    {supplyPoints.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : supplyPoints.length === 1 ? (
                <input type="hidden" name="supplyPointId" value={supplyPoints[0].id} />
              ) : null}
              {bills.length > 0 ? (
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                  <span>{labels.gasReadings.formBillLabel}</span>
                  <select
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                    name="billId"
                    defaultValue={editingReading?.billId ?? "auto"}
                  >
                    <option value="auto">{labels.gasReadings.formBillAuto}</option>
                    <option value="none">{labels.gasReadings.formBillEmpty}</option>
                    {bills.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {bill.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                <span>{labels.gasReadings.formNotesLabel}</span>
                <textarea
                  className="min-h-[96px] rounded-2xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                  name="notes"
                  defaultValue={editingReading?.notes ?? ""}
                  placeholder={labels.gasReadings.formNotesPlaceholder}
                />
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loadingLabel={labels.button.loading}
                  onClick={handleClose}
                >
                  {labels.gasReadings.formCancel}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  loadingLabel={labels.button.loading}
                >
                  {submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
