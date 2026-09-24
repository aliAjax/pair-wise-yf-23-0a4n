import { create } from "zustand";
import { deleteCueScene, listCueScene, saveCueScene } from "../api/CueScene";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { CueScene } from "../types/CueScene";

type State = {
  rows: CueScene[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (cue: CueScene) => Promise<CueScene>;
  remove: (id: number) => Promise<void>;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listCueScene(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async save(cue) {
    const saved = await saveCueScene(cue);
    console.info(LOG_TEMPLATES.CueScene[cue.id === 0 ? 0 : 1], saved);
    set((state) => ({
      rows: state.rows.some((row) => row.id === saved.id)
        ? state.rows.map((row) => (row.id === saved.id ? saved : row))
        : [...state.rows, saved]
    }));
    return saved;
  },
  async remove(id) {
    await deleteCueScene(id);
    set((state) => ({ rows: state.rows.filter((row) => row.id !== id) }));
  }
}));
