"use client";

type SortButtonProps = {
  label: string;
  isActive: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

export default function SortButton({ label, isActive, direction, onClick }: SortButtonProps) {
  const indicator = !isActive ? "↕" : direction === "asc" ? "↑" : "↓";

  return (
    <button className="flex items-center gap-2" type="button" onClick={onClick}>
      {label} <span>{indicator}</span>
    </button>
  );
}
