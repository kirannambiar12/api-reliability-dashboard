import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-response";
import { deleteServiceById } from "@/lib/store";
import { ApiErrorCode } from "@/lib/types";
import { HttpStatusCode } from "@/lib/types";
import type { ApiErrorResponse } from "@/lib/types";

interface DeleteServiceResponse { ok: true }

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<DeleteServiceResponse | ApiErrorResponse>> {
  const { id } = await context.params;

  if (!id) {
    return errorResponse(ApiErrorCode.ValidationError, "Service id is required.", HttpStatusCode.BadRequest);
  }

  const deleted = await deleteServiceById(id);

  if (!deleted) {
    return errorResponse(ApiErrorCode.NotFound, "Service not found.", HttpStatusCode.NotFound);
  }

  return NextResponse.json({ ok: true });
}
