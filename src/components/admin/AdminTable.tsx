import type { ReactNode } from "react";
import { Card } from "../ui/Card";

type AdminTableProps = {
  title: string;
  children: ReactNode;
};

export function AdminTable({ title, children }: AdminTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <span className="hidden rounded-full border border-line bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted sm:inline-flex">
            Admin
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}
