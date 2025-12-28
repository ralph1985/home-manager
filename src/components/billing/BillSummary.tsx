import type { ReactNode } from "react";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";
import { getServerLabels } from "@/infrastructure/ui/labels/server";

type SummaryRow = {
  label: string;
  value: ReactNode;
};

type BillSummaryProps = {
  title: string;
  providerName?: string | null;
  totalAmount: NumericValue;
  consumptionLabel?: string | null;
  issueDate: Date;
  paymentDate?: Date | null;
  pdfUrl?: string | null;
  extraRows?: SummaryRow[];
};

export default async function BillSummary({
  title,
  providerName,
  totalAmount,
  consumptionLabel,
  issueDate,
  paymentDate,
  pdfUrl,
  extraRows,
}: BillSummaryProps) {
  const labels = await getServerLabels();

  return (
    <div className="hm-panel p-6">
      <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm text-[color:var(--text-default)]">
        <div className="flex items-center justify-between">
          <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.provider}</dt>
          <dd className="font-semibold text-[color:var(--text-strong)]">
            {providerName ?? labels.common.emptyValue}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.totalAmount}</dt>
          <dd className="font-semibold text-[color:var(--text-strong)]">
            {formatCurrency(totalAmount)}
          </dd>
        </div>
        {consumptionLabel ? (
          <div className="flex items-center justify-between">
            <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.consumption}</dt>
            <dd className="font-semibold text-[color:var(--text-strong)]">{consumptionLabel}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.issueDate}</dt>
          <dd className="font-semibold text-[color:var(--text-strong)]">{formatDate(issueDate)}</dd>
        </div>
        {paymentDate ? (
          <div className="flex items-center justify-between">
            <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.paymentDate}</dt>
            <dd className="font-semibold text-[color:var(--text-strong)]">
              {formatDate(paymentDate)}
            </dd>
          </div>
        ) : null}
        {extraRows?.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-[color:var(--text-subtle)]">{row.label}</dt>
            <dd className="font-semibold text-[color:var(--text-strong)]">{row.value}</dd>
          </div>
        ))}
        {pdfUrl ? (
          <div className="flex items-center justify-between">
            <dt className="text-[color:var(--text-subtle)]">{labels.billSummary.pdf}</dt>
            <dd>
              <a
                className="text-sm font-semibold text-[color:var(--text-strong)] underline decoration-slate-300 underline-offset-4"
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                {labels.billSummary.openFile}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
