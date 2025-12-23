"use client";

import { hashString } from "@/components/tables/tableUtils";

type PillTagProps = {
  label: string;
};

const colorTokens = [
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-emerald-100", text: "text-emerald-800" },
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-rose-100", text: "text-rose-800" },
  { bg: "bg-lime-100", text: "text-lime-800" },
  { bg: "bg-indigo-100", text: "text-indigo-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
];

export default function PillTag({ label }: PillTagProps) {
  const index = hashString(label) % colorTokens.length;
  const color = colorTokens[index];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full ${color.bg} px-3 py-1 text-xs font-semibold ${color.text}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
