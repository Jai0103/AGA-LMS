import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "brand" | "success" | "neutral" | "warning";
};

const tones = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  neutral: "bg-white text-brand-700 border-brand-100",
  warning: "bg-accent-50 text-accent-700 border-accent-100",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
