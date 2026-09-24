import { mockData } from "../mocks/seedData";
import { readLocal, writeLocal } from "../utils/localStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { Fixture } from "../types/Fixture";

const endpoint = "/api/fixture";
const STORAGE_KEY = "stage-light.fixtures";

export async function listFixture(): Promise<Fixture[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const cached = readLocal<Fixture[] | null>(STORAGE_KEY, null);
  if (cached) return cached;
  const seeded = mockData.fixture.map((row) => ({ ...row })) as unknown as Fixture[];
  writeLocal(STORAGE_KEY, seeded);
  return seeded;
}

export async function saveFixture(payload: Fixture) {
  const rows = await listFixture();
  const next = rows.some((row) => row.id === payload.id)
    ? rows.map((row) => (row.id === payload.id ? payload : row))
    : [...rows, payload];
  writeLocal(STORAGE_KEY, next);
  console.info(LOG_TEMPLATES.Fixture[1], payload);
  return payload;
}
