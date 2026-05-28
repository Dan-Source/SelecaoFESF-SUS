import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  leftIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-outline";

  return (
    <button
      className={`${variantClass} ${fullWidth ? "btn-full" : ""} ${className ?? ""}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : leftIcon}
      <span>{loading ? "Carregando..." : children}</span>
    </button>
  );
}