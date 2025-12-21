type InfoPanelProps = {
  label: string;
  value: string;
};

export default function InfoPanel({ label, value }: InfoPanelProps) {
  return (
    <div className="hm-panel hm-shadow-soft flex items-center gap-4 px-5 py-4 text-sm text-slate-600">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <span className="text-3xl font-semibold text-slate-900">{value}</span>
    </div>
  );
}
