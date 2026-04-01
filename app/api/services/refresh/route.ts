import { NextResponse } from "next/server";

import { checkServiceHealth } from "@/lib/health";
import { readServices, writeServices } from "@/lib/store";
import type { ServicesListResponse } from "@/lib/types";

export async function POST(): Promise<NextResponse<ServicesListResponse>> {
  const services = await readServices();

  const refreshedServices = await Promise.all(
    services.map(async (service) => {
      const health = await checkServiceHealth(service.url);
      return {
        ...service,
        status: health.status,
        latencyMs: health.latencyMs,
        lastCheckedAt: health.lastCheckedAt,
        healthScore: health.healthScore,
      };
    }),
  );

  await writeServices(refreshedServices);

  return NextResponse.json({ services: refreshedServices });
}
