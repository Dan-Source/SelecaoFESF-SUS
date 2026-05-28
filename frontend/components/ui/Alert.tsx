import { ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
};

export function Alert({ variant = "info", children }: AlertProps) {
  return <div className={`alert alert-${variant}`}>{children}</div>;
}