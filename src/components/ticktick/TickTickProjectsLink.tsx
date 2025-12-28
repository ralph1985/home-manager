import Link from "next/link";

type TickTickProjectsLinkProps = {
  label: string;
  className?: string;
};

export default function TickTickProjectsLink({ label, className }: TickTickProjectsLinkProps) {
  return (
    <Link className={className} href="/ticktick/projects">
      {label}
    </Link>
  );
}
