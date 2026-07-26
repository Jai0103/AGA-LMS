import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "../ui/Card";

type AdminMetricCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
};

export function AdminMetricCard({ label, value, icon: Icon }: AdminMetricCardProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
          <Icon size={24} aria-hidden="true" />
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
      </div>
      <p className="mt-5 text-3xl font-bold text-ink">{displayValue}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}
