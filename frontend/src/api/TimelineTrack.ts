import { ensureSeeded, nextId } from "./bootstrap";
import { idbDelete, idbGetAll, idbPut, idbPutMany } from "../utils/indexedDb";
import { seedTimelineTracks } from "../mocks/seedData";
import type { TimelineTrack } from "../types/TimelineTrack";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  await ensureSeeded();
  return idbGetAll<TimelineTrack>("timelineTrack");
}

export async function saveTimelineTrack(payload: TimelineTrack): Promise<TimelineTrack> {
  await ensureSeeded();
  const next = payload.id === 0 ? { ...payload, id: await nextId("timelineTrack") } : payload;
  return idbPut("timelineTrack", next);
}

export async function deleteTimelineTrack(id: number): Promise<void> {
  await ensureSeeded();
  await idbDelete("timelineTrack", id);
}

export async function resetTimelineTracks() {
  await idbPutMany("timelineTrack", seedTimelineTracks);
}
