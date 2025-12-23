import type { NumericValue } from "@/components/billing/billingFormatters";
import BillsTable from "@/components/billing/BillsTable";

type BillListItem = {
  id: number;
  providerName?: string | null;
  invoiceNumber?: string | null;
  issueDate: Date;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  totalAmount: NumericValue;
  totalToPay?: NumericValue | null;
  consumptionLabel?: string | null;
  billType?: string | null;
  cancelsInvoiceNumber?: string | null;
  cancelsBillId?: number | null;
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

      <BillsTable
        emptyMessage={emptyMessage}
        rows={bills.map((bill) => ({
          id: bill.id,
          providerName: bill.providerName,
          invoiceNumber: bill.invoiceNumber,
          issueDate: bill.issueDate.getTime(),
          periodStart: bill.periodStart?.getTime() ?? null,
          periodEnd: bill.periodEnd?.getTime() ?? null,
          totalAmount: bill.totalAmount.toString(),
          totalToPay: bill.totalToPay != null ? bill.totalToPay.toString() : null,
          consumptionLabel: bill.consumptionLabel,
          billType: bill.billType,
          cancelsInvoiceNumber: bill.cancelsInvoiceNumber,
          cancelsHref: bill.cancelsBillId ? detailHref(bill.cancelsBillId) : null,
          href: detailHref(bill.id),
        }))}
      />
    </section>
  );
}
