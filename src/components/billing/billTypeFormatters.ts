import type { Labels } from "@/infrastructure/ui/labels";

const billTypeBadgeClasses: Record<string, string> = {
  factura_regular: "bg-emerald-100 text-emerald-800",
  factura_sustitutiva: "bg-amber-100 text-amber-800",
  factura_anulacion: "bg-rose-100 text-rose-800",
};

export function formatBillType(value: string | null | undefined, labels: Labels) {
  if (!value) return labels.common.emptyValue;
  if (value in labels.billTypes) {
    return labels.billTypes[value as keyof typeof labels.billTypes];
  }
  return value.replace(/_/g, " ");
}

export function billTypeBadgeClass(value?: string | null) {
  if (!value) return "bg-slate-100 text-slate-600";
  return billTypeBadgeClasses[value] ?? "bg-slate-100 text-slate-600";
}
