import type { Service } from "@/lib/types";

export interface ValidServiceInput {
  name: string;
  url: string;
}

export interface ValidationSuccess {
  ok: true;
  value: ValidServiceInput;
}

export interface ValidationFailure {
  ok: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

function normalizeServiceUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl.trim());

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("URL must start with http:// or https://");
  }

  return parsed.toString();
}

function isDuplicateServiceUrl(url: string, services: Service[]): boolean {
  let normalizedIncoming: string;

  try {
    normalizedIncoming = normalizeServiceUrl(url);
  } catch {
    return false;
  }

  return services.some((service) => {
    try {
      return normalizeServiceUrl(service.url) === normalizedIncoming;
    } catch {
      return false;
    }
  });
}

export function validateServiceInput(input: {
  name: string;
  url: string;
  existingServices?: Service[];
}): ValidationResult {
  const { name, url, existingServices = [] } = input;
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    return { ok: false, error: "Service name is required." };
  }

  if (normalizedName.length > 80) {
    return { ok: false, error: "Service name must be 80 characters or less." };
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeServiceUrl(url);
  } catch {
    return { ok: false, error: "Please enter a valid HTTP/HTTPS URL." };
  }

  if (isDuplicateServiceUrl(normalizedUrl, existingServices)) {
    return { ok: false, error: "This service URL is already being monitored." };
  }

  return {
    ok: true,
    value: {
      name: normalizedName,
      url: normalizedUrl,
    },
  };
}
