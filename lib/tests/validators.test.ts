import { describe, expect, it } from "vitest";

import { validateServiceInput } from "@/lib/validators";

describe("validateServiceInput", () => {
  it("rejects empty service name", () => {
    const result = validateServiceInput({
      name: "   ",
      url: "https://example.com",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Service name is required.");
    }
  });

  it("rejects invalid URL", () => {
    const result = validateServiceInput({
      name: "My API",
      url: "ftp://example.com",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Please enter a valid HTTP/HTTPS URL.");
    }
  });

  it("rejects duplicate URLs", () => {
    const result = validateServiceInput({
      name: "Duplicate",
      url: "https://api.example.com/health",
      existingServices: [
        {
          id: "svc-1",
          name: "Existing",
          url: "https://api.example.com/health",
          status: "UP",
          latencyMs: 120,
          lastCheckedAt: "2026-01-01T00:00:00.000Z",
          healthScore: 95,
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("This service URL is already being monitored.");
    }
  });

  it("rejects duplicate service names", () => {
    const result = validateServiceInput({
      name: "   existing   service ",
      url: "https://api.example.com/new-endpoint",
      existingServices: [
        {
          id: "svc-1",
          name: "Existing Service",
          url: "https://api.example.com/health",
          status: "UP",
          latencyMs: 120,
          lastCheckedAt: "2026-01-01T00:00:00.000Z",
          healthScore: 95,
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("This service name already exists.");
    }
  });

  it("returns normalized values for valid input", () => {
    const result = validateServiceInput({
      name: "   My   API   ",
      url: "https://example.com",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("My API");
      expect(result.value.url).toBe("https://example.com/");
    }
  });
});
