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
        <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">{emptyMessage}</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-default)]">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between">
                <span className="text-[color:var(--text-muted)]">{line.label}</span>
                <span className="font-semibold text-[color:var(--text-strong)]">
                  {formatCurrency(line.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
