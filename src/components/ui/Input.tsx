import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Input({ label, error, helperText, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        id={inputId}
        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
          error ? "border-red-300" : "border-line"
        } ${className}`}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm font-semibold text-red-600">{error}</span> : null}
      {!error && helperText ? <span className="mt-2 block text-xs text-muted">{helperText}</span> : null}
    </label>
  );
}
