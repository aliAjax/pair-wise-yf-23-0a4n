import { ensureSeeded, nextId } from "./bootstrap";
import { idbDelete, idbGetAll, idbPut, idbPutMany } from "../utils/indexedDb";
import { seedShowProjects } from "../mocks/seedData";
import type { ShowProject } from "../types/ShowProject";

export async function listShowProject(): Promise<ShowProject[]> {
  await ensureSeeded();
  return idbGetAll<ShowProject>("showProject");
}

export async function saveShowProject(payload: ShowProject): Promise<ShowProject> {
  await ensureSeeded();
  const next = payload.id === 0 ? { ...payload, id: await nextId("showProject") } : payload;
  return idbPut("showProject", next);
}

export async function deleteShowProject(id: number): Promise<void> {
  await ensureSeeded();
  await idbDelete("showProject", id);
}

export async function resetShowProjects() {
  await idbPutMany("showProject", seedShowProjects);
}
