"use client";

type FilterSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

export default function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="font-semibold uppercase tracking-[0.2em]">{label}</span>
      <select
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
