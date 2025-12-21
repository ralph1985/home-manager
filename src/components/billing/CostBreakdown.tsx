import { formatCurrency, type NumericValue } from "@/components/billing/billingFormatters";

type CostLine = {
  id: number;
  label: string;
  amount: NumericValue;
};

type CostBreakdownProps = {
  title: string;
  emptyMessage: string;
  lines: CostLine[];
};

export default function CostBreakdown({ title, emptyMessage, lines }: CostBreakdownProps) {
  return (
    <section className="mt-6">
      <div className="hm-panel p-6">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{emptyMessage}</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between">
                <span className="text-slate-600">{line.label}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(line.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
