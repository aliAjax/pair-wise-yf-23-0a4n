import { create } from "zustand";
import { deleteTimelineTrack, listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (track: TimelineTrack) => Promise<TimelineTrack>;
  remove: (id: number) => Promise<void>;
};

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listTimelineTrack(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async save(track) {
    const saved = await saveTimelineTrack(track);
    console.info(LOG_TEMPLATES.TimelineTrack[track.id === 0 ? 0 : 1], saved);
    set((state) => ({
      rows: state.rows.some((row) => row.id === saved.id)
        ? state.rows.map((row) => (row.id === saved.id ? saved : row))
        : [...state.rows, saved]
    }));
    return saved;
  },
  async remove(id) {
    await deleteTimelineTrack(id);
    set((state) => ({ rows: state.rows.filter((row) => row.id !== id) }));
  }
}));
