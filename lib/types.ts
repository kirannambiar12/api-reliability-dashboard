export type ServiceStatus = "UP" | "SLOW" | "DOWN";

export enum ApiErrorCode {
  RequestError = "REQUEST_ERROR",
  ValidationError = "VALIDATION_ERROR",
  NotFound = "NOT_FOUND",
  Conflict = "CONFLICT",
}

export enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  Conflict = 409,
}

export interface Service {
  id: string;
  name: string;
  url: string;
  status: ServiceStatus;
  latencyMs: number;
  lastCheckedAt: string;
  healthScore: number;
}

export interface ApiError {
  code: ApiErrorCode;
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
