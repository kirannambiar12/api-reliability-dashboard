"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { createService, deleteService, fetchServices, refreshService } from "@/lib/api-client";
import { API_PATHS, UI_TEXT } from "@/lib/dashboard-constants";
import { formatLatency, formatTimestamp, statusBadgeClasses } from "@/lib/dashboard-utils";

export default function Home() {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const servicesQuery = useQuery({
    queryKey: [API_PATHS.services],
    queryFn: fetchServices,
  });

  const createMutation = useMutation({
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

  const refreshMutation = useMutation({
    mutationFn: refreshService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Unable to refresh service.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [API_PATHS.services] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "Unable to delete service.");
    },
  });

  const sortedServices = useMemo(
    () => [...(servicesQuery.data?.services ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [servicesQuery.data?.services],
  );

  async function handleAddService(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    await createMutation.mutateAsync({ name, url });
  }

  async function handleRefresh(serviceId: string): Promise<void> {
    setActionError(null);
    await refreshMutation.mutateAsync(serviceId);
  }

  async function handleDelete(serviceId: string): Promise<void> {
    const confirmed = window.confirm("Delete this service?");
    if (!confirmed) return;
    setActionError(null);
    await deleteMutation.mutateAsync(serviceId);
  }

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
            placeholder="https://example.com/health"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>
        {formError ? <div className="mt-2"><ErrorState message={formError} /></div> : null}
      </section>

      <section className="rounded-lg border border-zinc-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Services</h2>
          <Button
            type="button"
            onClick={() => void servicesQuery.refetch()}
            disabled={servicesQuery.isFetching}
          >
            {servicesQuery.isFetching ? "Loading..." : "Reload"}
          </Button>
        </div>

        {servicesQuery.error instanceof Error ? (
          <div className="mb-3"><ErrorState message={servicesQuery.error.message} /></div>
        ) : null}

        {actionError ? <div className="mb-3"><ErrorState message={actionError} /></div> : null}

        {servicesQuery.isLoading ? (
          <LoadingState message={UI_TEXT.loadingServices} />
        ) : null}

        {!servicesQuery.isLoading && sortedServices.length === 0 ? (
          <EmptyState message={UI_TEXT.emptyServices} />
        ) : null}

        {!servicesQuery.isLoading && sortedServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-600">
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Latency</th>
                  <th className="px-3 py-2 font-medium">Last checked</th>
                  <th className="px-3 py-2 font-medium">Health score</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service) => {
                  const isRefreshBusy =
                    refreshMutation.isPending && refreshMutation.variables === service.id;
                  const isDeleteBusy =
                    deleteMutation.isPending && deleteMutation.variables === service.id;
                  const isBusy = isRefreshBusy || isDeleteBusy;
                  return (
                    <tr key={service.id} className="border-b border-zinc-100">
                      <td className="px-3 py-3">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-zinc-500">{service.url}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">{formatLatency(service.latencyMs)}</td>
                      <td className="px-3 py-3">{formatTimestamp(service.lastCheckedAt)}</td>
                      <td className="px-3 py-3">{service.healthScore}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => void handleRefresh(service.id)}
                            variant="secondary"
                            disabled={isBusy}
                            className="px-2.5 py-1 text-xs"
                          >
                            {isRefreshBusy ? "Refreshing..." : "Refresh"}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => void handleDelete(service.id)}
                            variant="danger"
                            disabled={isBusy}
                            className="px-2.5 py-1 text-xs"
                          >
                            {isDeleteBusy ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
