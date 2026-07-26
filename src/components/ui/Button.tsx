import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "dark" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent-500 text-white shadow-soft hover:bg-accent-600",
  secondary: "border border-brand-100 bg-white text-brand-700 hover:border-brand-500 hover:bg-brand-50",
  dark: "bg-ink text-white shadow-soft hover:bg-brand-700",
  ghost: "text-brand-700 hover:bg-brand-50",
};

export function Button({ children, className = "", variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
