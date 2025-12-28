"use client";

type FilterSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

export default function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-[color:var(--text-subtle)]">
      <span className="font-semibold uppercase tracking-[0.2em]">{label}</span>
      <select
        className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-1 text-sm text-[color:var(--text-default)]"
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
