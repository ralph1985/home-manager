import Link from "next/link";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";

type BillListItem = {
  id: number;
  providerName?: string | null;
  invoiceNumber?: string | null;
  issueDate: Date;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  totalAmount: NumericValue;
  consumptionLabel?: string | null;
};

type BillsListProps = {
  title: string;
  emptyMessage: string;
  bills: BillListItem[];
  detailHref: (billId: number) => string;
};

export default function BillsList({ title, emptyMessage, bills, detailHref }: BillsListProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {bills.length} factura{bills.length === 1 ? "" : "s"}
        </span>
      </div>

      {bills.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {bills.map((bill) => (
            <li key={bill.id} className="hm-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {bill.providerName ?? "Proveedor"}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    {bill.invoiceNumber ?? "Factura"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {bill.periodStart && bill.periodEnd
                      ? `${formatDate(bill.periodStart)} - ${formatDate(bill.periodEnd)}`
                      : formatDate(bill.issueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                  {bill.consumptionLabel ? (
                    <p className="mt-1 text-xs text-slate-500">{bill.consumptionLabel}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-6">
                <Link
                  className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href={detailHref(bill.id)}
                >
                  Ver detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
