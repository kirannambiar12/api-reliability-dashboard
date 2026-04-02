import { Button } from "@/components/ui/button";
import type { TableColumn } from "@/components/reusable/table";
import {
  formatDate,
  formatLatency,
  formatTime,
  statusBadgeClasses,
} from "@/lib/dashboard-utils";
import type { Service } from "@/lib/types";

export interface ServiceTableColumnsParams {
  onRefresh: (serviceId: string) => void;
  onDeleteClick: (service: Pick<Service, "id" | "name">) => void;
  isRefreshBusy: (service: Service) => boolean;
  isDeleteBusy: (service: Service) => boolean;
}

export function getServiceRowBusy(params: {
  isRefreshBusy: (service: Service) => boolean;
  isDeleteBusy: (service: Service) => boolean;
}): (service: Service) => boolean {
  return (service) => params.isRefreshBusy(service) || params.isDeleteBusy(service);
}

export function getServiceTableColumns({
  onRefresh,
  onDeleteClick,
  isRefreshBusy,
  isDeleteBusy,
}: ServiceTableColumnsParams): TableColumn<Service>[] {
  return [
    {
      id: "service",
      header: "Service",
      headerClassName: "w-[40%]",
      cellClassName: "",
      render: ({ row }) => (
        <>
          <p className="font-medium text-zinc-900">{row.name}</p>
          <p className="mt-1 break-all text-xs leading-5 text-zinc-500">{row.url}</p>
        </>
      ),
    },
    {
      id: "status",
      header: "Status",
      headerClassName: "w-[10%]",
      render: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "latency",
      header: "Latency",
      headerClassName: "w-[10%]",
      cellClassName: "whitespace-nowrap",
      render: ({ row }) => formatLatency(row.latencyMs),
    },
    {
      id: "lastChecked",
      header: "Last checked",
      headerClassName: "w-[18%]",
      cellClassName: "text-zinc-700",
      render: ({ row }) => (
        <>
          <p>{formatDate(row.lastCheckedAt)}</p>
          <p className="text-xs text-zinc-500">{formatTime(row.lastCheckedAt)}</p>
        </>
      ),
    },
    {
      id: "health",
      header: "Health",
      headerClassName: "w-[10%]",
      cellClassName: "whitespace-nowrap font-medium",
      render: ({ row }) => row.healthScore,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "w-[12%]",
      render: ({ row, rowBusy }) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
            type="button"
            onClick={() => void onRefresh(row.id)}
            variant="secondary"
            disabled={rowBusy}
            className="px-3 py-1.5 text-xs"
          >
            {isRefreshBusy(row) ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            type="button"
            onClick={() => onDeleteClick({ id: row.id, name: row.name })}
            variant="danger"
            disabled={rowBusy}
            className="px-3 py-1.5 text-xs"
          >
            {isDeleteBusy(row) ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];
}
