import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Input({ id, label, error, className, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="field">
      <span className="field-label">{label}</span>
      <input id={id} className={`${error ? "field-error" : ""} ${className ?? ""}`.trim()} {...props} />
      {error ? <span className="field-error-text">{error}</span> : null}
    </label>
  );
}