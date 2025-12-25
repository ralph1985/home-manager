import type { ReactNode } from "react";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";
import { labels } from "@/infrastructure/ui/labels/es";

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

export default function BillSummary({
  title,
  providerName,
  totalAmount,
  consumptionLabel,
  issueDate,
  paymentDate,
  pdfUrl,
  extraRows,
}: BillSummaryProps) {
  return (
    <div className="hm-panel p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">{labels.billSummary.provider}</dt>
          <dd className="font-semibold text-slate-900">
            {providerName ?? labels.common.emptyValue}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">{labels.billSummary.totalAmount}</dt>
          <dd className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</dd>
        </div>
        {consumptionLabel ? (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">{labels.billSummary.consumption}</dt>
            <dd className="font-semibold text-slate-900">{consumptionLabel}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">{labels.billSummary.issueDate}</dt>
          <dd className="font-semibold text-slate-900">{formatDate(issueDate)}</dd>
        </div>
        {paymentDate ? (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">{labels.billSummary.paymentDate}</dt>
            <dd className="font-semibold text-slate-900">{formatDate(paymentDate)}</dd>
          </div>
        ) : null}
        {extraRows?.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
        {pdfUrl ? (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">{labels.billSummary.pdf}</dt>
            <dd>
              <a
                className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
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
