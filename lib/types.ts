export type ServiceStatus = "UP" | "SLOW" | "DOWN";

export interface Service {
  id: string;
  name: string;
  url: string;
  status: ServiceStatus;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  healthScore: number;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface ServicesListResponse {
  services: Service[];
}

export interface ServiceResponse {
  service: Service;
}

export interface HealthCheckResult {
  status: ServiceStatus;
  latencyMs: number;
  lastCheckedAt: string;
  healthScore: number;
}