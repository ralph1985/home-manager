import type { NumericValue } from "@/components/billing/billingFormatters";
import BillsTable from "@/components/billing/BillsTable";
import { formatCountLabel } from "@/infrastructure/ui/labels";
import { getServerLabels } from "@/infrastructure/ui/labels/server";

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
  pdfUrl?: string | null;
};

type BillsListProps = {
  title: string;
  emptyMessage: string;
  bills: BillListItem[];
  detailHref: (billId: number) => string;
};

export default async function BillsList({
  title,
  emptyMessage,
  bills,
  detailHref,
}: BillsListProps) {
  const labels = await getServerLabels();

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
        <span className="text-sm text-[color:var(--text-subtle)]">
          {formatCountLabel(bills.length, labels.bills.countLabel)}
        </span>
      </div>

      <BillsTable
        emptyMessage={emptyMessage}
        labels={labels}
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
          pdfUrl: bill.pdfUrl ?? null,
        }))}
      />
    </section>
  );
}
