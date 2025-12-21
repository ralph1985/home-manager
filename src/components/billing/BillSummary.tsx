import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";

type SummaryRow = {
  label: string;
  value: string;
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
          <dt className="text-slate-500">Proveedor</dt>
          <dd className="font-semibold text-slate-900">{providerName ?? "-"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Importe total</dt>
          <dd className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</dd>
        </div>
        {consumptionLabel ? (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Consumo</dt>
            <dd className="font-semibold text-slate-900">{consumptionLabel}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Fecha de emision</dt>
          <dd className="font-semibold text-slate-900">{formatDate(issueDate)}</dd>
        </div>
        {paymentDate ? (
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Fecha de cargo</dt>
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
            <dt className="text-slate-500">PDF</dt>
            <dd>
              <a
                className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir archivo
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
