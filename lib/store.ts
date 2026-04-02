import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Service } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const SERVICES_JSON_PATH = path.join(DATA_DIR, "services.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readServices(): Promise<Service[]> {
  try {
    const raw = await readFile(SERVICES_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Service[];
  } catch {
    return [];
  }
}

export async function writeServices(services: Service[]): Promise<void> {
  await ensureDataDir();
  await writeFile(SERVICES_JSON_PATH, JSON.stringify(services, null, 2), "utf8");
}

export async function getServiceById(id: string): Promise<Service | null> {
  const services = await readServices();
  return services.find((service) => service.id === id) ?? null;
}

export async function addService(service: Service): Promise<void> {
  const services = await readServices();
  services.push(service);
  await writeServices(services);
}

export async function deleteServiceById(id: string): Promise<boolean> {
  const services = await readServices();
  const nextServices = services.filter((service) => service.id !== id);

  if (nextServices.length === services.length) {
    return false;
  }

  await writeServices(nextServices);
  return true;
}
