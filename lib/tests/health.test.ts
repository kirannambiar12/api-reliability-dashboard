import { describe, expect, it } from "vitest";

import { computeHealthScore, getStatus } from "@/lib/health";

describe("getStatus", () => {
  it("returns UP for 2xx responses below 500ms", () => {
    const status = getStatus({
      statusCode: 200,
      latencyMs: 120,
      didTimeout: false,
      hadNetworkError: false,
    });

    expect(status).toBe("UP");
  });

  it("returns SLOW for 2xx responses between 500ms and 1999ms", () => {
    const status = getStatus({
      statusCode: 204,
      latencyMs: 900,
      didTimeout: false,
      hadNetworkError: false,
    });

    expect(status).toBe("SLOW");
  });

  it("returns DOWN for non-2xx responses even with low latency", () => {
    const status = getStatus({
      statusCode: 503,
      latencyMs: 80,
      didTimeout: false,
      hadNetworkError: false,
    });

    expect(status).toBe("DOWN");
  });

  it("returns DOWN for timeout", () => {
    const status = getStatus({
      statusCode: 200,
      latencyMs: 100,
      didTimeout: true,
      hadNetworkError: false,
    });

    expect(status).toBe("DOWN");
  });

  it("returns DOWN for latency >= 2000ms", () => {
    const status = getStatus({
      statusCode: 200,
      latencyMs: 2000,
      didTimeout: false,
      hadNetworkError: false,
    });

    expect(status).toBe("DOWN");
  });
});

describe("computeHealthScore", () => {
  it("scores UP in 90-100 range", () => {
    expect(computeHealthScore("UP", 0)).toBe(100);
    expect(computeHealthScore("UP", 490)).toBeGreaterThanOrEqual(90);
  });

  it("scores SLOW in 60-80 range", () => {
    expect(computeHealthScore("SLOW", 500)).toBe(80);
    expect(computeHealthScore("SLOW", 1800)).toBeGreaterThanOrEqual(60);
  });

  it("returns 0 for DOWN", () => {
    expect(computeHealthScore("DOWN", 120)).toBe(0);
  });
});
