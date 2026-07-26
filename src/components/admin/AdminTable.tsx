import type { ReactNode } from "react";
import { Card } from "../ui/Card";

type AdminTableProps = {
  title: string;
  children: ReactNode;
};

export function AdminTable({ title, children }: AdminTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}
