import type { HTMLAttributes } from "react";

import { getPillClassName, type PillSize, type PillVariant } from "./pillStyles";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: PillVariant;
  size?: PillSize;
};

export default function Pill({
  variant = "solid",
  size = "sm",
  className = "",
  ...props
}: PillProps) {
  return <span className={getPillClassName({ variant, size, className })} {...props} />;
}
