import type { ButtonHTMLAttributes } from "react";

import { getPillClassName, type PillSize, type PillVariant } from "./pillStyles";

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  size?: PillSize;
};

export default function PillButton({
  variant = "solid",
  size = "sm",
  className = "",
  ...props
}: PillButtonProps) {
  return (
    <button
      className={getPillClassName({ variant, size, interactive: true, className })}
      {...props}
    />
  );
}
