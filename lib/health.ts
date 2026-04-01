import {
  HEALTH_CHECK_TIMEOUT_MS,
  LATENCY_UPPER_SLOW_MS,
  LATENCY_UPPER_UP_MS,
} from "@/lib/constants";
import type { HealthCheckResult, ServiceStatus } from "@/lib/types";

function isHttp2xx(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

function abortCall(timeoutMs: number): { controller: AbortController; abort: ReturnType<typeof setTimeout> } {
  const controller = new AbortController();
  const abort = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, abort };
}

export function getStatus(params: { statusCode?: number; latencyMs: number; didTimeout: boolean; hadNetworkError: boolean }): ServiceStatus {
  const { statusCode, latencyMs, didTimeout, hadNetworkError } = params;

  if (didTimeout || hadNetworkError || latencyMs >= LATENCY_UPPER_SLOW_MS) return "DOWN";

  if (typeof statusCode !== "number" || !isHttp2xx(statusCode)) return "DOWN";

  if (latencyMs < LATENCY_UPPER_UP_MS) return "UP";

  return "SLOW";
}

export function computeHealthScore(status: ServiceStatus, latencyMs: number): number {
  if (status === "UP") {
    const deduction = Math.floor(latencyMs / 100);
    return Math.max(90, 100 - deduction);
  }

  if (status === "SLOW") {
    const deduction = Math.floor((latencyMs - LATENCY_UPPER_UP_MS) / 100);
    return Math.max(60, 80 - deduction);
  }

  return 0;
}

export async function checkServiceHealth(url: string): Promise<HealthCheckResult> {

  const startedAt = performance.now();

  let statusCode: number | undefined;
  let didTimeout = false;
  let hadNetworkError = false;

  const { controller, abort } = abortCall(HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    statusCode = response.status;
  } catch (error) {
    if (error && typeof error === "object" && "name" in error &&
      error.name === "AbortError") {
      didTimeout = true;
    } else {
      hadNetworkError = true;
    }
  } finally {
    clearTimeout(abort);
  }

  const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
  const status = getStatus({ statusCode, latencyMs, didTimeout, hadNetworkError });

  return {
    status,
    latencyMs,
    lastCheckedAt: new Date().toISOString(),
    healthScore: computeHealthScore(status, latencyMs),
  };
}
