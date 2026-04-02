"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ConfirmModal } from "@/components/reusable/confirm-modal";
import { ServicesSection } from "@/components/reusable/services-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/ui/states";
import {
  createService,
  deleteService,
  fetchServices,
  refreshAllServices,
  refreshService,
} from "@/lib/api-client";
import { API_PATHS, UI_TEXT } from "@/lib/dashboard-constants";
import {
  getServiceRowBusy,
  getServiceTableColumns,
} from "@/lib/service-table-columns";

export default function Home() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pendingDeleteService, setPendingDeleteService] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: servicesData,
    error: servicesError,
    isLoading: isServicesLoading,
    isFetching: isServicesFetching,
  } = useQuery({
    queryKey: [API_PATHS.services],
    queryFn: fetchServices,
  });

  const {
    mutateAsync: mutateCreate,
    isPending: isCreatePending,
  } = useMutation({
    mutationFn: createService,
    onSuccess: async () => {
      setName("");
      setUrl("");
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Unable to create service.");
    },
  });

  const {
    mutateAsync: mutateRefresh,
    isPending: isRefreshPending,
    variables: refreshServiceId,
  } = useMutation({
    mutationFn: refreshService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Unable to refresh service.");
    },
  });

  const {
    mutateAsync: mutateDelete,
    isPending: isDeletePending,
    variables: deleteServiceId,
  } = useMutation({
    mutationFn: deleteService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Unable to delete service.");
    },
  });

  const {
    mutateAsync: mutateRefreshAll,
    isPending: isRefreshAllPending,
  } = useMutation({
    mutationFn: refreshAllServices,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Unable to refresh services.");
    },
  });

  async function handleRefresh(serviceId: string): Promise<void> {
    setActionError(null);
    await mutateRefresh(serviceId);
  }

  const sortedServices = useMemo(
    () => [...(servicesData?.services ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [servicesData?.services],
  );

  const isRefreshBusy = (service: { id: string }) =>
    Boolean(isRefreshPending && refreshServiceId === service.id);

  const isDeleteBusy = (service: { id: string }) =>
    Boolean(isDeletePending && deleteServiceId === service.id);

  const serviceTableColumns = getServiceTableColumns({
    onRefresh: handleRefresh,
    onDeleteClick: setPendingDeleteService,
    isRefreshBusy,
    isDeleteBusy,
  });

  const isServiceRowBusy = getServiceRowBusy({
    isRefreshBusy,
    isDeleteBusy,
  });

  async function handleAddService(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    await mutateCreate({ name, url });
  }

  async function handleDelete(serviceId: string): Promise<void> {
    setActionError(null);
    await mutateDelete(serviceId);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!pendingDeleteService) return;
    await handleDelete(pendingDeleteService.id);
    setPendingDeleteService(null);
  }

  const servicesQueryError =
    servicesError instanceof Error ? servicesError.message : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6 px-6 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{UI_TEXT.appTitle}</h1>
        <p className="text-sm text-zinc-600">{UI_TEXT.appSubtitle}</p>
      </header>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="mb-3 text-lg font-medium">Add Service</h2>
        <form onSubmit={handleAddService} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Service name"
          />
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={UI_TEXT.urlInputPlaceholder}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isCreatePending}
          >
            {isCreatePending ? "Adding..." : "Add"}
          </Button>
        </form>
        {formError ? <div className="mt-2"><ErrorState message={formError} /></div> : null}
      </section>

      <ServicesSection
        services={sortedServices}
        servicesQueryError={servicesQueryError}
        actionError={actionError}
        isServicesLoading={isServicesLoading}
        isReloading={isServicesFetching || isRefreshAllPending}
        columns={serviceTableColumns}
        isRowBusy={isServiceRowBusy}
        onReloadAll={() => {
          setActionError(null);
          void mutateRefreshAll();
        }}
      />

      <ConfirmModal
        isOpen={Boolean(pendingDeleteService)}
        title="Delete service"
        description={
          pendingDeleteService
            ? `Are you sure you want to delete "${pendingDeleteService.name}"?`
            : "Are you sure you want to delete this service?"
        }
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        isConfirming={isDeletePending}
        onCancel={() => setPendingDeleteService(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </main>
  );
}
