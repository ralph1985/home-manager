import type { Labels } from "@/infrastructure/ui/labels";

const billTypeBadgeClasses: Record<string, string> = {
  factura_regular: "bg-emerald-100 text-[color:var(--text-success)]",
  factura_sustitutiva: "bg-amber-100 text-[color:var(--text-warning)]",
  factura_anulacion: "bg-rose-100 text-[color:var(--text-danger)]",
};

export function formatBillType(value: string | null | undefined, labels: Labels) {
  if (!value) return labels.common.emptyValue;
  if (value in labels.billTypes) {
    return labels.billTypes[value as keyof typeof labels.billTypes];
  }
  return value.replace(/_/g, " ");
}

export function billTypeBadgeClass(value?: string | null) {
  if (!value) return "bg-slate-100 text-[color:var(--text-muted)]";
  return billTypeBadgeClasses[value] ?? "bg-slate-100 text-[color:var(--text-muted)]";
}
