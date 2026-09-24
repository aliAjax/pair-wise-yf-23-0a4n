import { idbGet, idbGetAll, idbPutMany, type StoreName } from "../utils/indexedDb";
import {
  seedCueScenes,
  seedFixtures,
  seedShowProjects,
  seedTimelineTracks
} from "../mocks/seedData";

const SEED_FLAG_KEY = "stage-light-seed-version";
const SEED_VERSION = "2026-09-24-execution-sheet";

const seedMap = {
  fixture: seedFixtures,
  cueScene: seedCueScenes,
  timelineTrack: seedTimelineTracks,
  showProject: seedShowProjects
} as const;

export async function ensureSeeded() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(SEED_FLAG_KEY) === SEED_VERSION) return;

  await Promise.all((Object.entries(seedMap) as [StoreName, typeof seedFixtures][]).map(async ([store, rows]) => {
    const existing = await idbGetAll(store);
    if (existing.length === 0) await idbPutMany(store, rows);
  }));
  localStorage.setItem(SEED_FLAG_KEY, SEED_VERSION);
}

export async function nextId(storeName: StoreName): Promise<number> {
  const rows = await idbGetAll<{ id: number }>(storeName);
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

export async function exists(storeName: StoreName, id: number) {
  return Boolean(await idbGet(storeName, id));
}
