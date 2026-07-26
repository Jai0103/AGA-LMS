import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

type AdminMetricCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function AdminMetricCard({ label, value, icon: Icon }: AdminMetricCardProps) {
  return (
    <Card className="p-5">
      <Icon className="text-brand-600" size={24} aria-hidden="true" />
      <p className="mt-4 text-3xl font-bold text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Card>
  );
}
