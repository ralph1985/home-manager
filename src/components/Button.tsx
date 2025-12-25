import type { ButtonHTMLAttributes } from "react";
const baseClassName =
  "hm-pill font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60";

const variantClassName = {
  primary: "hm-shadow-soft bg-slate-900 px-4 py-2 text-white hover:bg-slate-800",
  secondary:
    "border border-slate-900/10 bg-white px-4 py-2 text-slate-700 hover:border-slate-900/20 hover:bg-slate-50",
  ghost: "bg-transparent px-4 py-2 text-slate-700 hover:bg-slate-900/5",
  danger: "hm-shadow-soft bg-rose-600 px-4 py-2 text-white hover:bg-rose-700",
} as const;

type ButtonVariant = keyof typeof variantClassName;

const sizeClassName = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

type ButtonSize = keyof typeof sizeClassName;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel: string;
};

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  isLoading = false,
  loadingLabel,
  ...props
}: ButtonProps) {
  const classes = [baseClassName, variantClassName[variant], sizeClassName[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingLabel}
        </span>
      ) : (
        props.children
      )}
    </button>
  );
}
