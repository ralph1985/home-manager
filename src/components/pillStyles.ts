export const pillBaseClassName = "hm-pill font-semibold transition";

export const pillInteractiveClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30";

export const pillSizeClassName = {
  xs: "px-3 py-1 text-xs",
  xsWide: "px-4 py-2 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
} as const;

export type PillSize = keyof typeof pillSizeClassName;

export const pillVariantClassName = {
  solid: "bg-slate-900 text-white hover:bg-slate-800",
  solidElevated: "hm-shadow-soft bg-slate-900 text-white hover:bg-slate-800",
  outline:
    "border border-slate-900/10 bg-white text-slate-700 hover:border-slate-900/20 hover:bg-slate-50",
  outlineMuted: "border border-slate-900/10 bg-white text-slate-500",
  outlineMutedFaint: "border border-slate-900/10 bg-white text-slate-400",
  outlineSoft: "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-900/5",
  danger: "hm-shadow-soft bg-rose-600 text-white hover:bg-rose-700",
} as const;

export type PillVariant = keyof typeof pillVariantClassName;

type PillClassNameOptions = {
  variant?: PillVariant;
  size?: PillSize;
  interactive?: boolean;
  className?: string;
};

export function getPillClassName({
  variant = "solid",
  size = "sm",
  interactive = false,
  className = "",
}: PillClassNameOptions) {
  return [
    pillBaseClassName,
    pillSizeClassName[size],
    pillVariantClassName[variant],
    interactive ? pillInteractiveClassName : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
