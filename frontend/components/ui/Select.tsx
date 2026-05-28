import { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  children: ReactNode;
};

export function Select({ id, label, children, className, ...props }: SelectProps) {
  return (
    <label htmlFor={id} className="field">
      <span className="field-label">{label}</span>
      <select id={id} className={className} {...props}>
        {children}
      </select>
    </label>
  );
}