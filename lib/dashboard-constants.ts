export const API_PATHS = {
  services: "/api/services",
  refreshAll: "/api/services/refresh",
  refresh: (serviceId: string) => `/api/services/${serviceId}/refresh`,
  byId: (serviceId: string) => `/api/services/${serviceId}`,
};

export const UI_TEXT = {
  appTitle: "API Reliability Dashboard",
  appSubtitle: "Track health, latency, and uptime signals for monitored services.",
  loadingServices: "Loading services...",
  emptyServices: "No services yet. Add one above to start monitoring.",
  urlInputPlaceholder: "https://google.com",
};
