import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-response";
import { checkServiceHealth } from "@/lib/health";
import { addService, readServices } from "@/lib/store";
import { ApiErrorCode } from "@/lib/types";
import { HttpStatusCode } from "@/lib/types";
import type { ApiErrorResponse, Service, ServiceResponse, ServicesListResponse } from "@/lib/types";
import { validateServiceInput } from "@/lib/validators";

export async function GET(): Promise<NextResponse<ServicesListResponse>> {
  const services = await readServices();
  return NextResponse.json({ services });
}

export async function POST(request: Request): Promise<NextResponse<ServiceResponse | ApiErrorResponse>> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(ApiErrorCode.ValidationError, "Invalid JSON payload.", HttpStatusCode.BadRequest);
  }

  if (!payload || typeof payload !== "object") {
    return errorResponse(ApiErrorCode.ValidationError, "Request body must be an object.", HttpStatusCode.BadRequest);
  }

  const name = "name" in payload ? payload.name : undefined;
  const url = "url" in payload ? payload.url : undefined;

  if (typeof name !== "string" || typeof url !== "string") {
    return errorResponse(ApiErrorCode.ValidationError, "Both name and url are required.", HttpStatusCode.BadRequest);
  }

  const existingServices = await readServices();
  const validated = validateServiceInput({ name, url, existingServices });

  if (!validated.ok) {
    const isDuplicate = validated.error.toLowerCase().includes("already");
    return errorResponse(
      isDuplicate ? ApiErrorCode.Conflict : ApiErrorCode.ValidationError,
      validated.error,
      isDuplicate ? HttpStatusCode.Conflict : HttpStatusCode.BadRequest,
    );
  }

  const health = await checkServiceHealth(validated.value.url);
  const service: Service = {
    id: randomUUID(),
    name: validated.value.name,
    url: validated.value.url,
    status: health.status,
    latencyMs: health.latencyMs,
    lastCheckedAt: health.lastCheckedAt,
    healthScore: health.healthScore,
  };

  await addService(service);
  return NextResponse.json({ service }, { status: HttpStatusCode.Created });
}
