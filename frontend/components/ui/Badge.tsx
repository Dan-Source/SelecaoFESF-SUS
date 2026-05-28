import { ReactNode } from "react";

type BadgeVariant = "info" | "available" | "booked" | "cancelled";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};

export function Badge({ variant = "info", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}