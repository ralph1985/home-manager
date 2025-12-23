const billTypeLabels: Record<string, string> = {
  factura_regular: "Regular",
  factura_sustitutiva: "Sustitutiva",
  factura_anulacion: "Anulacion",
};

const billTypeBadgeClasses: Record<string, string> = {
  factura_regular: "bg-emerald-100 text-emerald-800",
  factura_sustitutiva: "bg-amber-100 text-amber-800",
  factura_anulacion: "bg-rose-100 text-rose-800",
};

export function formatBillType(value?: string | null) {
  if (!value) return "-";
  return billTypeLabels[value] ?? value.replace(/_/g, " ");
}

export function billTypeBadgeClass(value?: string | null) {
  if (!value) return "bg-slate-100 text-slate-600";
  return billTypeBadgeClasses[value] ?? "bg-slate-100 text-slate-600";
}
