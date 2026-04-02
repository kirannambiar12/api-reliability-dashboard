import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-response";
import { checkServiceHealth } from "@/lib/health";
import { readServices, writeServices } from "@/lib/store";
import { ApiErrorCode } from "@/lib/types";
import { HttpStatusCode } from "@/lib/types";
import type { ApiErrorResponse, ServiceResponse } from "@/lib/types";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<ServiceResponse | ApiErrorResponse>> {
  const { id } = await context.params;

  if (!id) {
    return errorResponse(
      ApiErrorCode.ValidationError,
      "Service id is required.",
      HttpStatusCode.BadRequest,
    );
  }

  const services = await readServices();
  const service = services.find((item) => item.id === id);

  if (!service) {
    return errorResponse(ApiErrorCode.NotFound, "Service not found.", HttpStatusCode.NotFound);
  }

  const health = await checkServiceHealth(service.url);
  const updatedService = {
    ...service,
    status: health.status,
    latencyMs: health.latencyMs,
    lastCheckedAt: health.lastCheckedAt,
    healthScore: health.healthScore,
  };

  const nextServices = services.map((item) => (item.id === id ? updatedService : item));
  await writeServices(nextServices);

  return NextResponse.json({ service: updatedService });
}
