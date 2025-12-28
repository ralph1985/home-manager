import type { AnchorHTMLAttributes } from "react";

import Link, { type LinkProps } from "next/link";

import { getPillClassName, type PillSize, type PillVariant } from "./pillStyles";

type PillLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    variant?: PillVariant;
    size?: PillSize;
  };

export default function PillLink({
  variant = "solid",
  size = "sm",
  className = "",
  ...props
}: PillLinkProps) {
  return (
    <Link
      className={getPillClassName({ variant, size, interactive: true, className })}
      {...props}
    />
  );
}
