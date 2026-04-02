import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { UI_TEXT } from "@/lib/dashboard-constants";
import type { Service } from "@/lib/types";

import { Table } from "./table";
import type { TableColumn } from "./table";

interface ServicesSectionProps {
  services: Service[];
  servicesQueryError: string | null;
  actionError: string | null;
  isServicesLoading: boolean;
  isReloading: boolean;
  columns: TableColumn<Service>[];
  isRowBusy: (service: Service) => boolean;
  onReloadAll: () => void;
}

export function ServicesSection({
  services,
  servicesQueryError,
  actionError,
  isServicesLoading,
  isReloading,
  columns,
  isRowBusy,
  onReloadAll,
}: ServicesSectionProps) {
  return (
    <section className="rounded-lg border border-zinc-200 p-5 min-h-[200px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Services</h2>
        <Button type="button" onClick={onReloadAll} disabled={isReloading}>
          {isReloading ? "Refreshing all..." : "Reload All"}
        </Button>
      </div>

      {servicesQueryError || actionError ? (
        <ErrorState message={servicesQueryError || actionError || "Something went wrong"} />
      ) : null}

      {isServicesLoading ? (
        <LoadingState message={UI_TEXT.loadingServices} />
      ) : null}

      {!isServicesLoading && services.length === 0 ? (
        <EmptyState message={UI_TEXT.emptyServices} />
      ) : null}

      {!isServicesLoading && services.length > 0 && !servicesQueryError && !actionError ? (
        <Table
          columns={columns}
          data={services}
          getRowKey={(row) => row.id}
          isRowBusy={isRowBusy}
        />
      ) : null}
    </section>
  );
}
