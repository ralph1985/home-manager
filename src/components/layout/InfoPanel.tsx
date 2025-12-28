type InfoPanelProps = {
  label: string;
  value: string;
};

export default function InfoPanel({ label, value }: InfoPanelProps) {
  return (
    <div className="hm-panel hm-shadow-soft flex items-center gap-4 px-5 py-4 text-sm text-[color:var(--text-muted)]">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
        {label}
      </span>
      <span className="text-3xl font-semibold text-[color:var(--text-strong)]">{value}</span>
    </div>
  );
}
