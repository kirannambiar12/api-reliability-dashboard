import { format } from "date-fns";
import type { ServiceStatus } from "@/lib/types";

export function statusBadgeClasses(status: ServiceStatus): string {
  if (status === "UP") return "bg-emerald-100 text-emerald-800";
  if (status === "SLOW") return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-800";
}

export function formatTimestamp(value: string | null): string {
  if (!value) return "Never";
  return format(new Date(value), "dd MMM, yyyy, h:mm:ss a");
}

export function formatDate(value: string | null): string {
  if (!value) return "Never";
  return format(new Date(value), "dd MMM, yyyy");
}

export function formatTime(value: string | null): string {
  if (!value) return "";
  return format(new Date(value), "h:mm:ss a");
}

export function formatLatency(value: number | null): string {
  if (value === null) return "N/A";
  return `${value} ms`;
}
