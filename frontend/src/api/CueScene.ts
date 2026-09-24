import { ensureSeeded, nextId } from "./bootstrap";
import { idbDelete, idbGetAll, idbPut, idbPutMany } from "../utils/indexedDb";
import { seedCueScenes } from "../mocks/seedData";
import type { CueScene } from "../types/CueScene";

export async function listCueScene(): Promise<CueScene[]> {
  await ensureSeeded();
  return idbGetAll<CueScene>("cueScene");
}

export async function saveCueScene(payload: CueScene): Promise<CueScene> {
  await ensureSeeded();
  const next = payload.id === 0 ? { ...payload, id: await nextId("cueScene") } : payload;
  return idbPut("cueScene", next);
}

export async function deleteCueScene(id: number): Promise<void> {
  await ensureSeeded();
  await idbDelete("cueScene", id);
}

export async function resetCueScenes() {
  await idbPutMany("cueScene", seedCueScenes);
}
