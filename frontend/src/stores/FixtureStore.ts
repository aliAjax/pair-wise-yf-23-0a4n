import { create } from "zustand";
import { deleteFixture, listFixture, saveFixture } from "../api/Fixture";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  save: (fixture: Fixture) => Promise<Fixture>;
  remove: (id: number) => Promise<void>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listFixture(), loading: false, loaded: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  async save(fixture) {
    const saved = await saveFixture(fixture);
    console.info(LOG_TEMPLATES.Fixture[fixture.id === 0 ? 0 : 1], saved);
    set((state) => {
      const exists = state.rows.some((row) => row.id === saved.id);
      return { rows: exists ? state.rows.map((row) => (row.id === saved.id ? saved : row)) : [...state.rows, saved] };
    });
    return saved;
  },
  async remove(id) {
    await deleteFixture(id);
    set((state) => ({ rows: state.rows.filter((row) => row.id !== id) }));
  }
}));
