import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <div className={`rounded-lg border border-line bg-white shadow-sm ${className}`}>{children}</div>;
}
