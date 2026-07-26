import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "brand" | "success" | "neutral" | "warning" | "danger";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  neutral: "border-line bg-slate-50 text-slate-700",
  warning: "border-orange-100 bg-orange-50 text-orange-700",
  danger: "border-rose-100 bg-rose-50 text-rose-700",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold leading-none ${tones[tone]}`}>
      {children}
    </span>
  );
}
