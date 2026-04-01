import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-900 ${className}`.trim()}
      {...props}
    />
  );
}
