import type { ApiErrorResponse, ServiceResponse, ServicesListResponse } from "@/lib/types";
import { API_PATHS } from "@/lib/dashboard-constants";

async function readApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.error?.message ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return (await response.json()) as T;
}

export async function fetchServices(): Promise<ServicesListResponse> {
  const response = await fetch(API_PATHS.services, { cache: "no-store" });
  return parseResponse<ServicesListResponse>(response);
}

export async function createService(input: { name: string; url: string }): Promise<ServiceResponse> {
  const response = await fetch(API_PATHS.services, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<ServiceResponse>(response);
}

export async function refreshService(serviceId: string): Promise<ServiceResponse> {
  const response = await fetch(API_PATHS.refresh(serviceId), { method: "POST" });
  return parseResponse<ServiceResponse>(response);
}

export async function deleteService(serviceId: string): Promise<void> {
  const response = await fetch(API_PATHS.byId(serviceId), { method: "DELETE" });
  await parseResponse<{ ok: true }>(response);
}
