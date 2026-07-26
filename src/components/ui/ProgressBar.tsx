import { formatPercent } from "../../lib/format";

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="h-2 rounded-full bg-slate-100" aria-label={`Progress ${formatPercent(value)}`}>
      <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: formatPercent(value) }} />
    </div>
  );
}
