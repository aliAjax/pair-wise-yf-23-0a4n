import { ensureSeeded, nextId } from "./bootstrap";
import { idbDelete, idbGetAll, idbPut, idbPutMany } from "../utils/indexedDb";
import { seedFixtures } from "../mocks/seedData";
import type { Fixture } from "../types/Fixture";

export async function listFixture(): Promise<Fixture[]> {
  await ensureSeeded();
  return idbGetAll<Fixture>("fixture");
}

export async function saveFixture(payload: Fixture): Promise<Fixture> {
  await ensureSeeded();
  const next = payload.id === 0 ? { ...payload, id: await nextId("fixture") } : payload;
  return idbPut("fixture", next);
}

export async function deleteFixture(id: number): Promise<void> {
  await ensureSeeded();
  await idbDelete("fixture", id);
}

export async function resetFixtures() {
  await idbPutMany("fixture", seedFixtures);
}
