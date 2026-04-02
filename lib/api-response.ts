import { NextResponse } from "next/server";

import type { ApiErrorResponse } from "@/lib/types";
import { ApiErrorCode } from "@/lib/types";
import { HttpStatusCode } from "@/lib/types";

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: HttpStatusCode,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}
